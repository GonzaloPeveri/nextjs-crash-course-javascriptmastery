"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const password = formData.get("password");

    // Replace with your secure password from environment variables
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";

    if (password === adminPassword) {
        const cookieStore = await cookies();

        // Settings the cookie with HttpOnly flag for security, valid for 1 day
        cookieStore.set({
            name: "admin_session",
            value: "true",
            httpOnly: true,
            path: "/",
            maxAge: 60 * 60 * 24
        });

        // Redirect to the admin dashboard on success
        redirect("/admin");
    }

    return { error: "Incorrect password" };
}

export async function logout() {
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");
    redirect("/admin/login");
}
