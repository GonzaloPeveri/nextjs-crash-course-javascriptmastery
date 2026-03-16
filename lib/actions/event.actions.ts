'use server';

import Event from "@/database/event.model";
import connectDB from "../mongodb";
import { revalidatePath } from "next/cache";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug });
        if (!event) return [];
        return await Event.find({ _id: { $ne: event._id }, tags: { $in: event.tags } }).lean();

    } catch {
        return []
    }
}

export const getAllEvents = async () => {
    try {
        await connectDB();
        const events = await Event.find().sort({ createdAt: -1 });
        return JSON.parse(JSON.stringify(events));
    } catch (error) {
        console.error("Error fetching events:", error);
        return [];
    }
}

export const getEventBySlug = async (slug: string) => {
    try {
        await connectDB();
        const event = await Event.findOne({ slug });
        return event ? JSON.parse(JSON.stringify(event)) : null;
    } catch (error) {
        console.error("Error fetching event by slug:", error);
        return null;
    }
}

export const createEvent = async (eventData: any) => {
    try {
        await connectDB();

        const newEvent = await Event.create(eventData);

        revalidatePath('/admin');
        revalidatePath('/events');
        revalidatePath('/');

        return JSON.parse(JSON.stringify(newEvent));
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
}

export const updateEvent = async (eventId: string, eventData: any) => {
    try {
        await connectDB();

        const updatedEvent = await Event.findByIdAndUpdate(
            eventId,
            eventData,
            { new: true }
        );

        if (!updatedEvent) {
            throw new Error("Event not found");
        }

        revalidatePath('/admin');
        revalidatePath('/events');
        revalidatePath('/');

        return JSON.parse(JSON.stringify(updatedEvent));

    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
}

export const deleteEvent = async (eventId: string) => {
    try {
        await connectDB();

        const deletedEvent = await Event.findByIdAndDelete(eventId);

        if (!deletedEvent) {
            throw new Error("Event not found");
        }

        // Delete image from Cloudinary if it exists
        if (deletedEvent.image && deletedEvent.image.includes('cloudinary.com')) {
            try {
                const parts = deletedEvent.image.split('/upload/');
                if (parts.length >= 2) {
                    let path = parts[1];
                    if (path.match(/^v\d+\//)) {
                        path = path.replace(/^v\d+\//, '');
                    }
                    const lastDotIndex = path.lastIndexOf('.');
                    if (lastDotIndex !== -1) {
                        path = path.substring(0, lastDotIndex);
                    }

                    if (path) {
                        await cloudinary.uploader.destroy(path);
                    }
                }
            } catch (imgError) {
                console.error("Failed to delete image from Cloudinary:", imgError);
                // We do NOT throw here so the event deletion from mongo still succeeds
            }
        }

        revalidatePath('/admin');
        revalidatePath('/events');
        revalidatePath('/');

        return JSON.parse(JSON.stringify(deletedEvent));
    } catch (error) {
        console.error("Error deleting event:", error);
        throw error;
    }
}