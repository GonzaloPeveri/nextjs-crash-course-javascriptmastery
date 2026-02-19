//app/api/events
import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from '@/database/event.model';

export async function POST(req: NextRequest) {
    try {
        // Conectamos a la base de datos
        await connectDB();

        // Parseamos el cuerpo de la solicitud como JSON
        const event = await req.json();

        // Verificamos que la estructura básica sea válida
        if (!event.title || !event.description || !event.date || !event.time) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        // Creamos el evento en la base de datos
        const createdEvent = await Event.create(event);

        // Respondemos con éxito
        return NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
    } catch (e) {
        // En caso de error, respondemos con el error
        console.error(e);
        return NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'unknown' }, { status: 400 });
    }
}
