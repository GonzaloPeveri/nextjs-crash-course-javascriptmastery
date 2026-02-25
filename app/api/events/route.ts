//app/api/events
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from '@/database/event.model';
import { v2 as cloudinary } from "cloudinary";

// 

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();

        let event;
        try {
            event = Object.fromEntries(formData.entries());
        }

        catch (e) {
            console.error("FULL ERROR:", e);

            if (e instanceof Error) {
                return NextResponse.json(
                    { message: "Event Creation Failed", error: e.message },
                    { status: 400 }
                );
            }

            return NextResponse.json(
                { message: "Event Creation Failed", error: String(e) },
                { status: 400 }
            );
        }

        const file = formData.get('image') as File;

        let tags = JSON.parse(formData.get('tags') as string);
        let agenda = JSON.parse(formData.get('agenda') as string);

        if (!file) {
            return NextResponse.json({ message: 'Image file is required' }, { status: 400 })
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            }).end(buffer);
        });

        event.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...event,
            tags: tags,
            agenda: agenda,
        });

        return NextResponse.json({ message: 'Event created Succesfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        console.error(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'unknown' }, { status: 400 })
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        return NextResponse.json({ message: 'Event fetched succesfully', events }, { status: 200 });

    } catch (e) {
        return NextResponse.json({ message: "Event fetching failed", error: e }, { status: 500 });
    }
}

// a route that accepts a slug as input -> returns the event details