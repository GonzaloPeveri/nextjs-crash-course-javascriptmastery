"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
    names: { _id: string; name: string }[];
};

export default function NameList({ names }: Props) {
    const [name, setName] = useState("");
    const router = useRouter();

    const handleSubmit = async () => {
        if (!name) return;

        await fetch("/api/test-db", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        });

        setName("");
        router.refresh(); // 🔥 mejor que reload
    };

    return (
        <div>
            <h2>Nombres guardados</h2>
            <ul>
                {names.map((n) => (
                    <li key={n._id}>{n.name}</li>
                ))}
            </ul>

            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre"
            />

            <button onClick={handleSubmit}>Guardar</button>
        </div>
    );
}
