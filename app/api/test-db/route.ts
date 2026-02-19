import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Name from "@/models/Name";

export async function POST(req: Request) {
    try {
        const { name } = await req.json();

        if (!name) {
            return NextResponse.json(
                { error: "Name is required" },
                { status: 400 }
            );
        }

        await connectDB();
        await Name.create({ name });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Error saving data" },
            { status: 500 }
        );
    }
}
