import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Booking from "@/database/booking.model";
import Event from "@/database/event.model";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { eventId, slug, email } = await req.json();

        console.log("Testing booking with:", { eventId, slug, email });

        // Check if event exists first manually to see if pre-save hook might be the issue
        const event = await Event.findById(eventId);
        console.log("Event found:", event ? "Yes" : "No");

        try {
            const booking = await Booking.create({ eventId, slug, email });
            return NextResponse.json({ success: true, booking });
        } catch (createError: any) {
            console.error("Booking.create error details:", createError);
            return NextResponse.json({
                success: false,
                error: createError.message,
                name: createError.name,
                errors: createError.errors
            }, { status: 400 });
        }

    } catch (error: any) {
        console.error("Test route error:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
