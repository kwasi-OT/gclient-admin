import { useEffect, useState, useCallback } from "react";
import { supabase } from "../server/supabaseClient";
import { MdOutlinePersonAddAlt } from "react-icons/md";
// import { IoAddOutline } from "react-icons/io5";
import CourseModal from "./CourseModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AlertModal from "./AlertModal";
import { MdOutlineEdit } from "react-icons/md";
import { ImBin } from "react-icons/im";
import { IoEyeOutline } from "react-icons/io5";
import CourseDetailModal from "./CourseDetailModal";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";
import { FaStar, FaUserGraduate } from "react-icons/fa";

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [coursesPerPage] = useState(6);
    const [totalCourses, setTotalCourses] = useState(0);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isAlertModalOpen, setAlertModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);
    const [courseStats, setCourseStats] = useState({});

    // Fetch courses with additional statistics
    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            // Get total count of courses
            const { count: totalCount, error: countError } = await supabase
                .from("courses")
                .select('*', { count: 'exact' });

            if (countError) {
                console.error("Error fetching courses count:", countError);
                setLoading(false);
                return;
            }

            // Fetch paginated courses with instructor details
            const { data: coursesData, error: coursesError } = await supabase
                .from("courses")
                .select(`
                    *,
                    users!inner(id, first_name, last_name)
                `)
                .range((currentPage - 1) * coursesPerPage, (currentPage * coursesPerPage) - 1)
                .order('created_at', { ascending: false });
            
            if (coursesError) {
                console.error("Error fetching courses", coursesError);
                setLoading(false);
                return;
            }

            // Fetch course statistics
            const statsPromises = coursesData.map(async (course) => {
                // Fetch enrollments count
                const { count: enrollmentsCount } = await supabase
                    .from("enrollments")
                    .select('*', { count: 'exact' })
                    .eq('course_id', course.id);

                // Fetch average rating
                const { data: reviewData } = await supabase
                    .from("reviews")
                    .select('rating')
                    .eq('course_id', course.id);

                const averageRating = reviewData && reviewData.length > 0
                    ? (reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length).toFixed(1)
                    : 'N/A';

                return {
                    courseId: course.id,
                    enrollmentsCount: enrollmentsCount || 0,
                    averageRating
                };
            });

            const statsResults = await Promise.all(statsPromises);
            const statsMap = statsResults.reduce((acc, stat) => {
                acc[stat.courseId] = {
                    enrollmentsCount: stat.enrollmentsCount,
                    averageRating: stat.averageRating
                };
                return acc;
            }, {});

            setCourses(coursesData || []);
            setCourseStats(statsMap);
            setTotalCourses(totalCount || 0);
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, coursesPerPage]);

    useEffect(() => {
        fetchCourses()
    }, [currentPage, fetchCourses]);

    const handleView = (id) => {
        setSelectedCourseId(id);
        setDetailModalOpen(true);
    };

    const handleEdit = (id) => {
        setSelectedCourse(courses.find((course) => course.id === id));
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        setSelectedCourse(courses.find((course) => course.id === id));
        setAlertModalOpen(true);
    };

    const handleAddCourse = () => {
        setSelectedCourse(null);
        setModalOpen(true);
    };

    // Calculate total pages
    const totalPages = Math.ceil(totalCourses / coursesPerPage);

    return (
        <div className="w-full flex flex-col gap-[1rem]">
            <div className="flex justify-end mb-4">
                {loading ? 
                    <Skeleton count={1} width={200} height={40}/> 
                    : 
                    <button onClick={handleAddCourse} className="bg-[var(--primary-blue)] text-[1.2rem] text-[white] px-4 py-2 rounded-[0.3rem] flex items-center gap-[.5rem]">
                        Add Course 
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
                            <th className="px-[1rem] py-[1rem]">Course Title</th>
                            <th className="px-[1rem] py-[1rem]">Instructor</th>
                            <th className="px-[1rem] py-[1rem]">Price</th>
                            <th className="px-[1rem] py-[1rem]">Statistics</th>
                            <th className="px-[1rem] py-[1rem]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {courses.map((course) => (
                            <tr key={course.id}>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem]">{course.title}</td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem]">
                                    {course.users.first_name} {course.users.last_name}
                                </td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem]">
                                    ${course.price.toFixed(2)}
                                </td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem]">
                                    <div className="flex items-center gap-[1rem]">
                                        <div className="flex items-center gap-[0.5rem]">
                                            <FaStar color="var(--primary-yellow)"/>
                                            <span>{courseStats[course.id]?.averageRating || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-[0.5rem]">
                                            <FaUserGraduate color="var(--primary-blue)"/>
                                            <span>{courseStats[course.id]?.enrollmentsCount || 0}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] text-center">
                                    <button onClick={() => handleView(course.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] mr-[0.5rem] bg-[var(--light-blue)]">
                                        <IoEyeOutline size={25} color="var(--primary-blue)"/></button>
                                    <button onClick={() => handleEdit(course.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] mr-[0.5rem] bg-[var(--input-active-bg)]">
                                        <MdOutlineEdit size={25} color="var(--primary-lemon-green)"/></button>
                                    <button onClick={() => handleDelete(course.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] bg-[var(--input-error-bg)]">
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
            {/* Course Modal */}
            <CourseModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)} 
                course={selectedCourse} 
                onSave={fetchCourses} 
            />

            {/* Alert Modal */}
            <AlertModal 
                isOpen={isAlertModalOpen} 
                onClose={() => setAlertModalOpen(false)} 
                onConfirm={fetchCourses} 
                course={selectedCourse} 
            />

            {/* Course Detail Modal */}
            <CourseDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                courseId={selectedCourseId}
                courseStats={courseStats[selectedCourseId]}
            />
        </div>
    )
}

export default Courses;