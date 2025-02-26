import { useEffect, useState, useCallback } from "react";
import { supabase } from "../server/supabaseClient"
import { MdOutlinePersonAddAlt } from "react-icons/md";
import InstructorModal from "./InstructorModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AlertModal from "./AlertModal";
import AvatarPlaceholder from "../assets/avatar.jpg"
import { MdOutlineEdit } from "react-icons/md";
import { ImBin } from "react-icons/im";
import { IoEyeOutline } from "react-icons/io5";


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
    };

    const handleAddInstructor = () => {
        setSelectedInstructor(null);
        setModalOpen(true);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // if (loading) return (
    //     <div className="w-full text-center flex flex-col justify-center items-center">
    //         <Skeleton count={10}/>
    //     </div>
    // );

    
    return (
        <div className="w-full flex flex-col gap-[1rem]">
            <div className="flex justify-end mb-4">
                {loading ? 
                    <Skeleton count={1} width={200} height={40}/> 
                    : 
                    <button onClick={handleAddInstructor} className="bg-[var(--primary-blue)] text-[1.2rem] text-[white] px-4 py-2 rounded-[0.3rem] flex items-center gap-[.5rem]">
                        Add Instructor 
                        <MdOutlinePersonAddAlt size={25}/>
                    </button>
                }
            </div>
            {loading ? (
                <Skeleton count={10} height={40}/>
            ) : (
                <table className="w-full bg-[var(--input-bg)]">
                    <thead>
                        <tr>
                            <th className=" px-[1rem] py-[1rem]">Profile Picture</th>
                            <th className=" px-[1rem] py-[1rem]">First Name</th>
                            <th className=" px-[1rem] py-[1rem]">Last Name</th>
                            <th className=" px-[1rem] py-[1rem]">Date Joined</th>
                            <th className=" px-[1rem] py-[1rem]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {instructor.map((instructor) => (
                            <tr key={instructor.id}>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] text-center">
                                    {
                                        instructor.profile_picture ? (
                                            <img src={instructor.profile_picture} alt={`${instructor.first_name} ${instructor.last_name}`} className="w-[3rem] h-[3rem] rounded-full" />
                                        ) : (
                                            <img src={AvatarPlaceholder} alt={`${instructor.first_name} ${instructor.last_name}`} className="w-[3rem] h-[3rem] rounded-full" />
                                        )
                                    }
                                </td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] ">{instructor.first_name}</td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] ">{instructor.last_name}</td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] ">{new Date(instructor.created_at).toLocaleDateString()}</td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] text-center ">
                                    <button onClick={() => handleView(instructor.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] mr-[0.5rem] bg-[var(--light-blue)]">
                                        <IoEyeOutline size={25} color="var(--primary-blue)"/></button>
                                    <button onClick={() => handleEdit(instructor.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] mr-[0.5rem] bg-[var(--input-active-bg)]">
                                        <MdOutlineEdit size={25} color="var(--primary-lemon-green)"/></button>
                                    <button onClick={() => handleDelete(instructor.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] bg-[var(--input-error-bg)]">
                                        <ImBin size={25} color="var(--primary-red)"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Pagination */}
            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(totalInstructors / instructorsPerPage) }, (_, index) => (
                    <button 
                        key={index + 1}
                        onClick={() => paginate(index + 1)}
                        className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-[var(--primary-blue)] text-white' : 'bg-[var(--primary-blue)]'}`}
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
