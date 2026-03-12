'use server';

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
    secure: true
});

export const uploadImage = async (formData: FormData) => {
    try {
        const file = formData.get('image') as File;
        if (!file) throw new Error('No file provided');

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if (error) return reject(error);
                resolve(results);
            }).end(buffer);
        });

        return { secure_url: (uploadResult as any).secure_url };
    } catch (error) {
        console.error("Image upload failed:", error);
        throw error;
    }
}
