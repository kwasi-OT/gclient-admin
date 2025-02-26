import { useEffect, useState, useCallback } from "react";
import { supabase } from "../server/supabaseClient"
import { MdOutlinePersonAddAlt } from "react-icons/md";
import InstructorModal from "./InstructorModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AlertModal from "./AlertModal";


const Instructors = () => {
    const[instructor, setInstructor] = useState([]);
    const[loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [instructorsPerPage] = useState(5);
    const [totalInstructors, setTotalInstructors] = useState(0);
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isAlertModalOpen, setAlertModalOpen] = useState(false);


    // get all instructors
    const fetchInstructors = useCallback(async () => {
        setLoading(true);
        const { data, error, count } = await supabase
            .from("users")
            .select("*")
            .eq("role", "instructor")
            .range((currentPage - 1) * instructorsPerPage, currentPage * instructorsPerPage - 1)
            
        if (error) {
            console.error("Error fetching instructors", error);
        } else {
            setInstructor(data);
            setTotalInstructors(count);
        }
        setLoading(false);
    }, [currentPage, instructorsPerPage]);

    useEffect(() => {
        fetchInstructors()
    }, [currentPage, fetchInstructors]);

    const handleView = (id) => {
        // Logic to view instructor details
        console.log("View instructor:", id);
    };

    const handleEdit = (id) => {
        setSelectedInstructor(instructor.find((instructor) => instructor.id === id));
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        setSelectedInstructor(instructor.find((instructor) => instructor.id === id));
        setAlertModalOpen(true);
        // const { error } = await supabase.from("users").delete().eq("id", id);
        // if (error) {
        //     console.error("Error deleting instructor:", error);
        // } else {
        //     fetchInstructors(); // Refresh the list after deletion
        // }
    };

    const handleAddInstructor = () => {
        setSelectedInstructor(null);
        setModalOpen(true);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return (
        <div className="w-full text-center flex flex-col justify-center items-center">
            <Skeleton count={10}/>
        </div>
    );

    
    return (
        <div className="w-full flex flex-col gap-[1rem]">
            <div className="flex justify-end mb-4">
                <button 
                    onClick={handleAddInstructor} 
                    className="bg-[var(--primary-blue)] text-[white] px-4 py-2 rounded-[.3rem] flex items-center gap-[.5rem]">
                    Add Instructor
                    <MdOutlinePersonAddAlt size={20}/>
                </button>
            </div>
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
            {/* Pagination */}
            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(totalInstructors / instructorsPerPage) }, (_, index) => (
                    <button 
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    >
                        {index + 1}
                    </button>
                ))}
            </div>
            {/* Instructor Modal */}
            <InstructorModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)} 
                instructor={selectedInstructor} 
                onSave={fetchInstructors} 
            />

            {/* Alert Modal */}
            <AlertModal 
                isOpen={isAlertModalOpen} 
                onClose={() => setAlertModalOpen(false)} 
                onConfirm={fetchInstructors} 
                instructor={selectedInstructor} 
            />
        </div>
    )
}

export default Instructors
