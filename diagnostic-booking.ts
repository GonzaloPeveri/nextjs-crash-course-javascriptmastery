import mongoose from 'mongoose';
import Booking from './database/booking.model';
import Event from './database/event.model';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function runTest() {
    if (!MONGODB_URI) {
        console.error("MONGODB_URI is not defined");
        return;
    }

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected successfully.");

        const eventId = "699ca23e40eecd64b62fd195";
        const slug = "cloud-next-2026";
        const email = "diagnostic-" + Date.now() + "@example.com";

        console.log(`Testing booking for eventId: ${eventId}, email: ${email}`);

        // Check if event exists
        const event = await Event.findById(eventId);
        if (!event) {
            console.warn(`Warning: Event with ID ${eventId} not found in DB.`);
            // List some events to see what's there
            const someEvents = await Event.find().limit(5);
            console.log("Available events:", someEvents.map(e => ({ id: e._id, title: e.title })));
        } else {
            console.log("Event confirmed exists:", event.title);
        }

        try {
            const booking = await Booking.create({ eventId, slug, email });
            console.log("Booking created successfully:", booking._id);
        } catch (err: any) {
            console.error("Booking creation failed!");
            console.error("Error Name:", err.name);
            console.error("Error Message:", err.message);
            if (err.errors) {
                console.error("Validation Errors:", JSON.stringify(err.errors, null, 2));
            }
        }

    } catch (error) {
        console.error("Test failed:", error);
    } finally {
        await mongoose.connection.close();
        console.log("Connection closed.");
    }
}

runTest();
