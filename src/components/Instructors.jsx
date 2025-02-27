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
import InstructorDetailModal from "./InstructorDetailModal";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";



const Instructors = () => {
    const[instructor, setInstructor] = useState([]);
    const[loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [instructorsPerPage] = useState(6);
    const [totalInstructors, setTotalInstructors] = useState(0);
    const [selectedInstructor, setSelectedInstructor] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isAlertModalOpen, setAlertModalOpen] = useState(false);
    const [selectedInstructorId, setSelectedInstructorId] = useState(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);


    // get all instructors
    const fetchInstructors = useCallback(async () => {
        setLoading(true);
        // First, get the total count of instructors
        const { count: totalCount, error: countError } = await supabase
            .from("users")
            .select('*', { count: 'exact' })
            .eq("role", "instructor");

        if (countError) {
            console.error("Error fetching instructor count:", countError);
            setLoading(false);
            return;
        }

        // Then fetch paginated instructors
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("role", "instructor")
            .range((currentPage - 1) * instructorsPerPage, (currentPage * instructorsPerPage) - 1)
            .order('created_at', { ascending: false });

            
        if (error) {
            console.error("Error fetching instructors", error);
        } else {
            setInstructor(data || []);
            setTotalInstructors(totalCount || 0);
        }
        setLoading(false);
    }, [currentPage, instructorsPerPage]);

    useEffect(() => {
        fetchInstructors()
    }, [currentPage, fetchInstructors]);

    const handleView = (id) => {
        setSelectedInstructorId(id);
        setDetailModalOpen(true);
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

    // const paginate = (pageNumber) => setCurrentPage(pageNumber);

    // Calculate total pages
    const totalPages = Math.ceil(totalInstructors / instructorsPerPage);
    
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
            {totalPages > 1 && (
                <div className="flex justify-center gap-[0.5rem] mt-[2rem] space-x-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-[var(--light-blue)] rounded-[0.3rem] disabled:opacity-50"
                    >
                        <MdOutlineChevronLeft size={25} color="var(--primary-blue)"/>
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 rounded ${
                                currentPage === index + 1 
                                    ? 'bg-[var(--placeholder-grey)] text-[var(--text-grey)]' 
                                    : 'bg-[var(--bg-white)] text-[var(--primary-black)]'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-[var(--light-blue)] rounded-[0.3rem] disabled:opacity-50"
                    >
                        <MdOutlineChevronRight size={25} color="var(--primary-blue)"/>
                    </button>
                </div>
            )}
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

            {/* Instructor Detail Modal */}
            <InstructorDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                instructorId={selectedInstructorId}
            />
        </div>
    )
}

export default Instructors
