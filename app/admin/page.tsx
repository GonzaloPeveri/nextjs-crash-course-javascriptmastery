"use client"

import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { getAllEvents, updateEvent, createEvent, deleteEvent } from "@/lib/actions/event.actions"
import { logout } from "@/lib/actions/auth.actions"

type Event = {
    _id: string
    title: string
    slug?: string
    image: string
    visible?: boolean
    description?: string
    overview?: string
    venue?: string
    location?: string
    date?: string
    time?: string
    mode?: string
    audience?: string
    agenda?: string[]
    organizer?: string
    tags?: string[]
}

export default function AdminPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    async function fetchEvents() {
        try {
            const data = await getAllEvents()
            setEvents(data)
            if (data && data.length > 0 && !selectedEvent) {
                setSelectedEvent(data[0])
            }
        } catch (error) {
            console.error("Failed to fetch events:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchEvents()
    }, [])

    function addEvent() {
        const newEvent = {
            _id: `new-${Date.now()}`,
            title: "New Event",
            image: "https://res.cloudinary.com/dwwplmecd/image/upload/v1773365999/gray_kkswla.png",
            visible: false,
            description: "",
            overview: "",
            venue: "",
            location: "",
            date: "",
            time: "",
            mode: "online",
            audience: "",
            agenda: [],
            organizer: "",
            tags: []
        }

        setEvents([...events, newEvent])
    }

    async function handleDeleteEvent() {
        if (!selectedEvent) return;

        const isConfirmed = window.confirm("Are you sure you want to permanently delete this event? This action cannot be undone.");
        if (!isConfirmed) return;

        // If the event exists in the database (not just a local draft), remove it from DB
        if (!selectedEvent._id.startsWith('new-')) {
            try {
                await deleteEvent(selectedEvent._id);
            } catch (error) {
                console.error("Failed to delete event:", error);
                alert("There was an error deleting the event from the database.");
                return;
            }
        }

        // Remove from the local UI state
        setEvents(events.filter(e => e._id !== selectedEvent._id));
        setSelectedEvent(null);
    }

    async function toggleVisibility() {
        if (!selectedEvent) return

        // If undefined, we consider it visible, so the new state will be hidden (false)
        const newVisibility = selectedEvent.visible === false ? true : false;

        // Optimistic update for UI
        const updated = events.map(e =>
            e._id === selectedEvent._id ? { ...e, visible: newVisibility } : e
        )
        setEvents(updated)

        const updatedEventData = {
            ...selectedEvent,
            visible: newVisibility
        }
        setSelectedEvent(updatedEventData)

        // Database update
        try {
            await updateEvent(selectedEvent._id, { visible: newVisibility })
        } catch (error) {
            console.error("Failed to update visibility:", error)
            // Revert optimistic update on error
            fetchEvents()
        }
    }

    function updateField(field: keyof Event, value: any) {
        if (!selectedEvent) return

        const updatedEvent = { ...selectedEvent, [field]: value }
        setSelectedEvent(updatedEvent)

        const updatedList = events.map(e =>
            e._id === selectedEvent._id ? updatedEvent : e
        )
        setEvents(updatedList)
    }

    async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0 || !selectedEvent) return;

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Server response error");
            }

            const result = await response.json();

            if (result && result.secure_url) {
                updateField('image', result.secure_url);
                alert("Image uploaded successfully");
            } else {
                alert("The response does not contain a valid image");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("There was an error uploading the image. Check the console for more details.");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    }

    async function saveChanges() {
        if (!selectedEvent) return

        setIsSaving(true)
        try {
            const { _id, createdAt, updatedAt, ...dataToSave } = selectedEvent as any;

            let savedEvent;
            if (_id.startsWith('new-')) {
                // Determine if we are creating a new event
                savedEvent = await createEvent(dataToSave);
            } else {
                // Otherwise update existing event
                savedEvent = await updateEvent(_id, dataToSave);
            }

            setSelectedEvent(savedEvent);
            alert("Changes saved successfully");
            await fetchEvents(); // Refresh left panel list
        } catch (error) {
            console.error("Failed to save changes:", error)
            alert("Error saving changes")
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">

            {/* LEFT PANEL */}
            <div className="w-1/3 border-r border-gray-200 bg-white p-6 flex flex-col shadow-sm relative z-20">

                <div className="flex justify-between items-center mb-6 shrink-0">
                    <h2 className="text-2xl font-bold text-gray-800">Events</h2>
                    <button
                        onClick={async () => await logout()}
                        className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50"
                    >
                        Logout
                    </button>
                </div>

                <button
                    onClick={addEvent}
                    className="mb-6 w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium py-2.5 rounded-lg shadow-sm shrink-0"
                >
                    + Create New Event
                </button>

                {isLoading ? (
                    <div className="flex justify-center p-8 shrink-0">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : events.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 shrink-0">No events created yet.</p>
                ) : (
                    <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                        <ul className="space-y-2">
                            {events.map(event => (
                                <li
                                    key={event._id}
                                    onClick={() => {
                                        if (selectedEvent?._id !== event._id) {
                                            setSelectedEvent(event)
                                        }
                                    }}
                                    className={`p-3 cursor-pointer rounded-lg transition-all duration-200 flex items-center justify-between
                                        ${selectedEvent?._id === event._id
                                            ? "bg-blue-50 border border-blue-200 shadow-sm"
                                            : "hover:bg-gray-50 border border-transparent"}`}
                                >
                                    <span className={`font-medium truncate pr-4 ${selectedEvent?._id === event._id ? "text-blue-700" : "text-gray-700"}`}>
                                        {event.title || 'Untitled'}
                                    </span>
                                    {event.visible === false && (
                                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">Hidden</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 bg-gray-50 relative overflow-hidden flex flex-col z-10">

                {selectedEvent ? (
                    <div className="flex-1 overflow-y-auto p-8 relative">

                        <div className="max-w-3xl mx-auto space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">

                            <div className="flex justify-between items-center border-b pb-4">
                                <h2 className="text-2xl font-bold text-gray-800">Edit Details</h2>
                                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{selectedEvent._id}</span>
                            </div>

                            {/* Image Section */}
                            <div className="space-y-3 relative group">
                                <label className="block text-sm font-semibold text-gray-700">Main Image</label>
                                {selectedEvent.image && (
                                    <div className="w-full h-64 relative rounded-xl overflow-hidden shadow-sm bg-gray-100 flex items-center justify-center border border-gray-200 group-hover:opacity-90 transition-opacity">
                                        <Image
                                            fill
                                            src={selectedEvent.image.startsWith('http') ? selectedEvent.image : 'https://res.cloudinary.com/dwwplmecd/image/upload/v1773365999/gray_kkswla.png'}
                                            alt={selectedEvent.title}
                                            className="object-cover w-full h-full"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://res.cloudinary.com/dwwplmecd/image/upload/v1773365999/gray_kkswla.png'
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                            <span className="text-white font-medium px-4 py-2 bg-black/50 rounded-lg">Upload new image</span>
                                        </div>
                                    </div>
                                )}

                                <input
                                    type="file"
                                    accept="image/*"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium rounded-lg border border-blue-200 transition-colors flex items-center disabled:opacity-50"
                                    >
                                        {isUploading ? (
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                                        )}
                                        Upload from PC
                                    </button>

                                    <input
                                        value={selectedEvent.image}
                                        onChange={(e) => updateField('image', e.target.value)}
                                        className="flex-1 text-sm border-gray-300 rounded-lg bg-gray-50 border p-2 text-gray-500"
                                        placeholder="Image URL"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-4 md:col-span-2">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Name (Title)</label>
                                        <input
                                            value={selectedEvent.title}
                                            onChange={(e) => updateField('title', e.target.value)}
                                            className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 w-full rounded-lg transition-all"
                                            placeholder="Ex: Advanced React Course..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Summary (Overview) *</label>
                                        <textarea
                                            value={selectedEvent.overview || ''}
                                            onChange={(e) => updateField('overview', e.target.value)}
                                            rows={2}
                                            className="resize-none border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 w-full rounded-lg transition-all"
                                            placeholder="Brief summary of the event..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Full Description *</label>
                                        <textarea
                                            value={selectedEvent.description || ''}
                                            onChange={(e) => updateField('description', e.target.value)}
                                            rows={5}
                                            className="resize-none border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 w-full rounded-lg transition-all"
                                            placeholder="Detailed description..."
                                        />
                                    </div>
                                </div>

                                {/* Date and Time */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-800 border-b pb-2">Date and Time</h3>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Date</label>
                                        <input
                                            type="date"
                                            value={selectedEvent.date || ''}
                                            onChange={(e) => updateField('date', e.target.value)}
                                            className="border border-gray-300 p-2.5 w-full rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Time (Ex: 18:00)</label>
                                        <input
                                            type="time"
                                            value={selectedEvent.time || ''}
                                            onChange={(e) => updateField('time', e.target.value)}
                                            className="border border-gray-300 p-2.5 w-full rounded-lg"
                                        />
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-4">
                                    <h3 className="font-medium text-gray-800 border-b pb-2">Location</h3>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Mode</label>
                                        <select
                                            value={selectedEvent.mode || 'online'}
                                            onChange={(e) => updateField('mode', e.target.value)}
                                            className="border border-gray-300 p-2.5 w-full rounded-lg bg-white"
                                        >
                                            <option value="online">Online</option>
                                            <option value="offline">In-person (Offline)</option>
                                            <option value="hybrid">Hybrid</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Venue (Location)</label>
                                        <input
                                            value={selectedEvent.venue || ''}
                                            onChange={(e) => updateField('venue', e.target.value)}
                                            className="border border-gray-300 p-2.5 w-full rounded-lg"
                                            placeholder="Ex: YouTube Live / Auditorium..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-600 mb-1">Location / Link</label>
                                        <input
                                            value={selectedEvent.location || ''}
                                            onChange={(e) => updateField('location', e.target.value)}
                                            className="border border-gray-300 p-2.5 w-full rounded-lg"
                                            placeholder="Ex: Meet URL, or address..."
                                        />
                                    </div>
                                </div>

                                {/* Target & Organizers */}
                                <div className="space-y-4 md:col-span-2">
                                    <h3 className="font-medium text-gray-800 border-b pb-2">Additional Details</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Organizer</label>
                                            <input
                                                value={selectedEvent.organizer || ''}
                                                onChange={(e) => updateField('organizer', e.target.value)}
                                                className="border border-gray-300 p-2.5 w-full rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Audience (Audience)</label>
                                            <input
                                                value={selectedEvent.audience || ''}
                                                onChange={(e) => updateField('audience', e.target.value)}
                                                className="border border-gray-300 p-2.5 w-full rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Tags (Comma separated)</label>
                                            <input
                                                value={selectedEvent.tags?.join(', ') || ''}
                                                onChange={(e) => {
                                                    const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
                                                    updateField('tags', tags)
                                                }}
                                                className="border border-gray-300 p-2.5 w-full rounded-lg"
                                                placeholder="Ex: react, frontend, web"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-600 mb-1">Agenda (Comma separated)</label>
                                            <input
                                                value={selectedEvent.agenda?.join(', ') || ''}
                                                onChange={(e) => {
                                                    const agenda = e.target.value.split(',').map(a => a.trim()).filter(a => a);
                                                    updateField('agenda', agenda)
                                                }}
                                                className="border border-gray-300 p-2.5 w-full rounded-lg"
                                                placeholder="Ex: Welcome, Part 1, Q&A"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Bar (Not Floating) */}
                            <div className="flex flex-wrap gap-4 items-center pt-8 mt-8 border-t border-gray-100">
                                <button
                                    onClick={saveChanges}
                                    disabled={isSaving}
                                    className={`transition-colors text-white font-medium px-8 py-3 rounded-lg shadow-sm flex items-center text-lg
                                        ${isSaving ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-100'}`}
                                >
                                    {isSaving ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Saving...
                                        </>
                                    ) : 'Save Changes'}
                                </button>

                                <button
                                    onClick={toggleVisibility}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-3 rounded-lg border border-gray-300 transition-colors"
                                >
                                    {selectedEvent.visible === false ? "Show on web" : "Hide on web"}
                                </button>

                                <button
                                    onClick={handleDeleteEvent}
                                    className="bg-red-50 text-red-600 hover:bg-red-100 font-medium px-6 py-3 rounded-lg border border-red-200 transition-colors ml-auto"
                                >
                                    Delete
                                </button>
                            </div>

                        </div>

                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                        <p className="text-xl font-medium">Select an event to edit</p>
                    </div>
                )}

            </div>

        </div>
    )
}
