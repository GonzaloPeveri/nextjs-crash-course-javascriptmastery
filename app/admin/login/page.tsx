"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth.actions";

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(async (prevState: any, formData: FormData) => {
        return await login(formData);
    }, null);

    return (
        <div className="flex h-screen items-center justify-center bg-gray-50 font-sans">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Admin Login</h1>
                    <p className="text-gray-500 mt-2">Enter your password to access the panel</p>
                </div>

                <form action={formAction} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            required
                            className="text-black w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                            placeholder="••••••••"
                        />
                    </div>

                    {state?.error && (
                        <p className="text-red-500 text-sm font-medium text-center bg-red-50 p-3 rounded-lg border border-red-100">
                            {state.error}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-lg transition-colors flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isPending ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            "Sign In"
                        )}
                    </button>

                    <a href="/" className="block text-center text-sm text-gray-500 hover:text-gray-800 transition-colors mt-4">
                        &larr; Back to home
                    </a>
                </form>
            </div>
        </div>
    );
}
