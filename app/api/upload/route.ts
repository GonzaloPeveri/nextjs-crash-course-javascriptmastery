import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

// Ensure Cloudinary is configured (Next.js loads .env automatically)
// It will use CLOUDINARY_URL if it exists.
// We also explicitly configure it in case they use individual keys.
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json({ message: 'No image file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if (error) {
                    console.error("Cloudinary upload_stream error:", error);
                    return reject(error);
                }
                resolve(results);
            }).end(buffer);
        });

        return NextResponse.json({
            message: 'Image uploaded successfully',
            secure_url: (uploadResult as any).secure_url
        }, { status: 200 });

    } catch (e) {
        console.error("API Upload failed:", e);
        return NextResponse.json(
            { message: "Image upload failed", error: String(e) },
            { status: 500 }
        );
    }
}
