import { useEffect, useState, useCallback } from "react";
import { supabase } from "../server/supabaseClient"
import { MdOutlinePersonAddAlt } from "react-icons/md";
import StudentModal from "./StudentModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AlertModal from "./AlertModal";
import AvatarPlaceholder from "../assets/avatar.jpg"
import { MdOutlineEdit } from "react-icons/md";
import { ImBin } from "react-icons/im";
import { IoEyeOutline } from "react-icons/io5";
import StudentDetailModal from "./StudentDetailModal";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";

const Students = () => {
    const[student, setStudent] = useState([]);
    const[loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [studentsPerPage] = useState(6);
    const [totalStudents, setTotalStudents] = useState(0);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isAlertModalOpen, setAlertModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);

    // get all students
    const fetchStudents = useCallback(async () => {
        setLoading(true);
        // First, get the total count of students
        const { count: totalCount, error: countError } = await supabase
            .from("users")
            .select('*', { count: 'exact' })
            .eq("role", "student");

        if (countError) {
            console.error("Error fetching instructor count:", countError);
            setLoading(false);
            return;
        }

        // Then fetch paginated students
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("role", "student")
            .range((currentPage - 1) * studentsPerPage, (currentPage * studentsPerPage) - 1)
            .order('created_at', { ascending: false });

            
        if (error) {
            console.error("Error fetching students", error);
        } else {
            setStudent(data || []);
            setTotalStudents(totalCount || 0);
        }
        setLoading(false);
    }, [currentPage, studentsPerPage]);

    useEffect(() => {
        fetchStudents()
    }, [currentPage, fetchStudents]);

    const handleView = (id) => {
        setSelectedStudentId(id);
        setDetailModalOpen(true);
    };

    const handleEdit = (id) => {
        setSelectedStudent(student.find((student) => student.id === id));
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        setSelectedStudent(student.find((student) => student.id === id));
        setAlertModalOpen(true);
    };

    const handleAddStudent = () => {
        setSelectedStudent(null);
        setModalOpen(true);
    };

    // Calculate total pages
    const totalPages = Math.ceil(totalStudents / studentsPerPage);

    return (
        <div className="w-full flex flex-col gap-[1rem]">
            <div className="flex justify-end mb-4">
                {loading ? 
                    <Skeleton count={1} width={200} height={40}/> 
                    : 
                    <button onClick={handleAddStudent} className="bg-[var(--primary-blue)] text-[1.2rem] text-[white] px-4 py-2 rounded-[0.3rem] flex items-center gap-[.5rem]">
                        Add Student 
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
                        {student.map((student) => (
                            <tr key={student.id}>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] text-center">
                                    {
                                        student.profile_picture ? (
                                            <img src={student.profile_picture} alt={`${student.first_name} ${student.last_name}`} className="w-[3rem] h-[3rem] rounded-full" />
                                        ) : (
                                            <img src={AvatarPlaceholder} alt={`${student.first_name} ${student.last_name}`} className="w-[3rem] h-[3rem] rounded-full" />
                                        )
                                    }
                                </td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] ">{student.first_name}</td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] ">{student.last_name}</td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] ">{new Date(student.created_at).toLocaleDateString()}</td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] text-center ">
                                    <button onClick={() => handleView(student.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] mr-[0.5rem] bg-[var(--light-blue)]">
                                        <IoEyeOutline size={25} color="var(--primary-blue)"/></button>
                                    <button onClick={() => handleEdit(student.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] mr-[0.5rem] bg-[var(--input-active-bg)]">
                                        <MdOutlineEdit size={25} color="var(--primary-lemon-green)"/></button>
                                    <button onClick={() => handleDelete(student.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] bg-[var(--input-error-bg)]">
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
            {/* Student Modal */}
            <StudentModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)} 
                student={selectedStudent} 
                onSave={fetchStudents} 
            />

            {/* Alert Modal */}
            <AlertModal 
                isOpen={isAlertModalOpen} 
                onClose={() => setAlertModalOpen(false)} 
                onConfirm={fetchStudents} 
                student={selectedStudent} 
            />

            {/* Student Detail Modal */}
            <StudentDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                studentId={selectedStudentId}
            />
        </div>
    )
}

export default Students
