import { useEffect, useState } from "react";
import { supabase } from "../server/supabaseClient"

const Instructors = () => {
    const[instructor, setInstructor] = useState([]);
    const[loading, setLoading] = useState(true);

    // get all instructors
    const fetchInstructors = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("role", "instructor")
            
        if (error) {
            console.error("Error fetching instructors", error);
        } else {
            setInstructor(data);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchInstructors()
    }, [])

    const handleView = (id) => {
        // Logic to view instructor details
        console.log("View instructor:", id);
    };

    const handleEdit = (id) => {
        // Logic to edit instructor details
        console.log("Edit instructor:", id);
    };

    const handleDelete = async (id) => {
        const { error } = await supabase.from("users").delete().eq("id", id);
        if (error) {
            console.error("Error deleting instructor:", error);
        } else {
            fetchInstructors(); // Refresh the list after deletion
        }
    };

    if (loading) return <p>Loading...</p>;

    
    return (
        <div className="w-full">
            <table className="min-w-full bg-white border border-gray-300">
                <thead>
                    <tr>
                        <th className="border-b-2 border-gray-300 px-4 py-2">Profile Picture</th>
                        <th className="border-b-2 border-gray-300 px-4 py-2">First Name</th>
                        <th className="border-b-2 border-gray-300 px-4 py-2">Last Name</th>
                        <th className="border-b-2 border-gray-300 px-4 py-2">Date Joined</th>
                        <th className="border-b-2 border-gray-300 px-4 py-2">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {instructor.map((instructor) => (
                        <tr key={instructor.id}>
                            <td className="border-b border-gray-300 px-4 py-2">
                                <img src={instructor.profile_picture} alt={`${instructor.first_name} ${instructor.last_name}`} className="w-10 h-10 rounded-full" />
                            </td>
                            <td className="border-b border-gray-300 px-4 py-2">{instructor.first_name}</td>
                            <td className="border-b border-gray-300 px-4 py-2">{instructor.last_name}</td>
                            <td className="border-b border-gray-300 px-4 py-2">{new Date(instructor.created_at).toLocaleDateString()}</td>
                            <td className="border-b border-gray-300 px-4 py-2">
                                <button onClick={() => handleView(instructor.id)} className="text-blue-500 hover:underline">View</button>
                                <button onClick={() => handleEdit(instructor.id)} className="text-yellow-500 hover:underline mx-2">Edit</button>
                                <button onClick={() => handleDelete(instructor.id)} className="text-red-500 hover:underline">Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default Instructors
