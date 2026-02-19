import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";

// events/nextjs-conf-15

type RouteParams = {
    params: Promise<{
        slug: string;
    }>;
};

/**
 * GET /api/events/[slug]
 * Fetches a single event by its slug
 */

export async function GET(
    req: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    try {
        //Connect to database
        await connectDB();

        //await and extract slug from params
        const { slug } = await params;

        // validate slug parameter

        if (!slug || typeof slug !== 'string' || slug.trim() === '') {
            return NextResponse.json(
                { message: 'Invalid or missing slug parameter' },
                { status: 400 }
            );
        }

        //Sanitize slug (remove any potential malicious input)

        const sanitizedSlug = slug.trim().toLowerCase();

        //Query event by slug
        const event = await Event.findOne({ slug: sanitizedSlug }).lean();

        //Handle event not found
        if (!event) {
            return NextResponse.json(
                { message: `Event with slug '${sanitizedSlug}' not found` },
                { status: 404 }
            );
        }

        // Return successful response with event data
        return NextResponse.json(
            { message: 'Event fetched successfully', event },
            { status: 200 }
        );
    } catch (error) {
        //Log error for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching event by slug: ', error);
        }

        // Handle specific error types
        if (error instanceof Error) {
            //Handle database connection errors
            if (error.message.includes('MONGODB_URI')) {
                return NextResponse.json(
                    { message: 'Database configuration error' },
                    { status: 500 }
                );
            }

            return NextResponse.json(
                { message: 'Failed to fetch event', error: error.message },
                { status: 500 }
            );
        }

        //Handle unknown errors
        return NextResponse.json(
            { message: 'An unexpected error has ocurred' },
            { status: 500 }
        );
    }



}