"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { getAllEvents } from "@/lib/actions/event.actions"

type Event = {
    _id: string
    title: string
    image: string
    visible?: boolean
    description?: string
    venue?: string
    location?: string
    date?: string
    time?: string
    mode?: string
    audience?: string
    organizer?: string
}

export default function AdminPage() {
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await getAllEvents()
                setEvents(data)
                if (data && data.length > 0) {
                    setSelectedEvent(data[0])
                }
            } catch (error) {
                console.error("Failed to fetch events:", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchEvents()
    }, [])

    function addEvent() {
        const newEvent = {
            _id: Date.now().toString(),
            title: "New Event",
            image: "https://via.placeholder.com/400",
            visible: false
        }

        setEvents([...events, newEvent])
    }

    function deleteEvent() {
        if (!selectedEvent) return
        setEvents(events.filter(e => e._id !== selectedEvent._id))
        setSelectedEvent(null)
    }

    function toggleVisibility() {
        if (!selectedEvent) return

        const updated = events.map(e =>
            e._id === selectedEvent._id ? { ...e, visible: !e.visible } : e
        )

        setEvents(updated)
        setSelectedEvent({
            ...selectedEvent,
            visible: !selectedEvent.visible
        })
    }

    function updateTitle(title: string) {
        if (!selectedEvent) return
        setSelectedEvent({ ...selectedEvent, title })
    }

    function saveChanges() {
        if (!selectedEvent) return

        const updated = events.map(e =>
            e._id === selectedEvent._id ? selectedEvent : e
        )

        setEvents(updated)
        // Here we would typically call a server action to save the changes to the DB
    }

    return (
        <div className="flex h-screen bg-gray-50 text-gray-900 font-sans">

            {/* LEFT PANEL */}
            <div className="w-1/3 border-r border-gray-200 bg-white p-6 overflow-y-auto shadow-sm">

                <h2 className="text-2xl font-bold mb-6 text-gray-800">Cursos / Eventos</h2>

                <button
                    onClick={addEvent}
                    className="mb-6 w-full bg-blue-600 hover:bg-blue-700 transition-colors text-white font-medium py-2.5 rounded-lg shadow-sm"
                >
                    + Crear Nuevo Evento
                </button>

                {isLoading ? (
                    <div className="flex justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                ) : events.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No hay eventos creados todavía.</p>
                ) : (
                    <ul className="space-y-2">
                        {events.map(event => (
                            <li
                                key={event._id}
                                onClick={() => setSelectedEvent(event)}
                                className={`p-3 cursor-pointer rounded-lg transition-all duration-200 flex items-center justify-between
                                    ${selectedEvent?._id === event._id
                                        ? "bg-blue-50 border border-blue-200 shadow-sm"
                                        : "hover:bg-gray-50 border border-transparent"}`}
                            >
                                <span className={`font-medium ${selectedEvent?._id === event._id ? "text-blue-700" : "text-gray-700"}`}>
                                    {event.title}
                                </span>
                                {event.visible === false && (
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Oculto</span>
                                )}
                            </li>
                        ))}
                    </ul>
                )}

            </div>

            {/* RIGHT PANEL */}
            <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">

                {selectedEvent ? (
                    <div className="max-w-3xl mx-auto space-y-6 bg-white p-8 rounded-xl shadow-sm border border-gray-100">

                        <div className="flex justify-between items-center border-b pb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Editar Detalle</h2>
                        </div>

                        {selectedEvent.image && (
                            <div className="w-full h-64 relative rounded-xl overflow-hidden shadow-sm bg-gray-100 flex items-center justify-center">
                                {/* Next.js Image component ideally, but regular img for arbitrary URLs */}
                                <img
                                    src={selectedEvent.image.startsWith('http') ? selectedEvent.image : 'https://via.placeholder.com/800x400?text=No+Image'}
                                    alt={selectedEvent.title}
                                    className="object-cover w-full h-full"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x400?text=Error+Loading+Image'
                                    }}
                                />
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del evento / curso</label>
                                <input
                                    value={selectedEvent.title}
                                    onChange={(e) => updateTitle(e.target.value)}
                                    className="border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 p-3 w-full rounded-lg transition-all"
                                    placeholder="Ej: Curso de React Advanced..."
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-6 border-t mt-8">

                            <button
                                onClick={saveChanges}
                                className="bg-green-600 hover:bg-green-700 transition-colors text-white font-medium px-6 py-2.5 rounded-lg shadow-sm"
                            >
                                Guardar Cambios
                            </button>

                            <button
                                onClick={toggleVisibility}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-2.5 rounded-lg border border-gray-300 transition-colors"
                            >
                                {selectedEvent.visible === false ? "Mostrar en la web" : "Ocultar en la web"}
                            </button>

                            <button
                                onClick={deleteEvent}
                                className="bg-red-50 text-red-600 hover:bg-red-100 font-medium px-6 py-2.5 rounded-lg border border-red-200 transition-colors ml-auto"
                            >
                                Eliminar
                            </button>

                        </div>

                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-gray-400 flex-col">
                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"></path></svg>
                        <p className="text-xl font-medium">Selecciona un evento para editarlo</p>
                    </div>
                )}

            </div>

        </div>
    )
}
