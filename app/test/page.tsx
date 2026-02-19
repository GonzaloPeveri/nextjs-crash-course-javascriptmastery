import connectDB from "@/lib/mongodb";
import Name from "@/models/Name";
import NameList from "@/components/TestNameList";

export default async function Home() {
    await connectDB();

    const namesFromDb = await Name.find().lean();

    const names = namesFromDb.map(n => ({
        _id: n._id.toString(),
        name: n.name,
        createdAt: n.createdAt?.toISOString(),
        updatedAt: n.updatedAt?.toISOString(),
    }));

    return (
        <main style={{ padding: 20 }}>
            <h1>MongoDB + Mongoose funcionando</h1>

            <NameList names={names} />
        </main>
    );
}
