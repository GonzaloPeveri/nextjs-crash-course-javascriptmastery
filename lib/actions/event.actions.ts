'use server';

import Event from "@/database/event.model";
import connectDB from "../mongodb";
import { revalidatePath } from "next/cache";

export const getSimilarEventsBySlug = async (slug: string) => {
    try {
        await connectDB();

        const event = await Event.findOne({ slug });
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

        return JSON.parse(JSON.stringify(updatedEvent));

    } catch (error) {
        console.error("Error updating event:", error);
        throw error;
    }
}