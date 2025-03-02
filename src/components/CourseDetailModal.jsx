import { useState, useEffect } from 'react';
import { supabase } from '../server/supabaseClient';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { FaStar, FaUserGraduate, FaChalkboardTeacher, FaComment } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import { FaBook } from 'react-icons/fa';

const CourseDetailModal = ({ isOpen, onClose, courseId, courseStats }) => {
    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [category, setCategory] = useState([]);
    const [subCategory, setSubCategory] = useState([]);

    useEffect(() => {
        const fetchCourseDetails = async () => {
            if (!isOpen || !courseId) return;

            setLoading(true);
            try {
                // Fetch course details with instructor information
                const { data: courseData, error: courseError } = await supabase
                    .from('courses')
                    .select(`
                        *,
                        users:instructor_id (first_name, last_name, email),
                        categories:category_id (name),
                        sub_categories:sub_category_id (name)
                    `)
                    .eq('id', courseId)
                    .single();

                if (courseError) {
                    console.error('Error fetching course details:', courseError);
                    return;
                }

                // Fetch course reviews with student details
                const { data: reviewsData, error: reviewsError } = await supabase
                    .from('reviews')
                    .select(`
                        *,
                        users(first_name, last_name, email)
                    `)
                    .eq('course_id', courseId);

                if (reviewsError) {
                    console.error('Error fetching reviews:', reviewsError);
                }

                // Fetch course enrollments with student details
                const { data: enrollmentsData, error: enrollmentsError } = await supabase
                    .from('enrollments')
                    .select(`
                        *,
                        users(first_name, last_name, email)
                    `)
                    .eq('course_id', courseId);

                if (enrollmentsError) {
                    console.error('Error fetching enrollments:', enrollmentsError);
                }

                setCourse(courseData);
                setReviews(reviewsData || []);
                setEnrollments(enrollmentsData || []);
                // Set category and sub-category directly from the joined query
                setCategory(courseData.categories?.name || 'Not Specified');
                setSubCategory(courseData.sub_categories?.name || 'Not Specified');
            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseDetails();
    }, [isOpen, courseId]);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, index) => (
            <FaStar 
                key={index} 
                color={index < rating ? "var(--primary-yellow)" : "var(--primary-grey)"}
            />
        ));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-[0] bg-[var(--primary-grey)] opacity-95 flex items-center justify-center z-50">
            <div className="bg-[var(--bg-white)] w-[90%] max-w-[900px] max-h-[90vh] overflow-y-auto rounded-[0.3rem] shadow-[var(--shadow-md)] p-[1rem] relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-[1rem] text-gray-600 hover:text-gray-900 bg-[var(--primary-blue)]"
                >
                    <IoClose size={30} />
                </button>
                <h2 className="text-2xl mb-4 text-center">Course Details</h2>
                
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton height={30} />
                        <Skeleton height={200} />
                        <Skeleton height={100} />
                    </div>
                ) : course ? (
                    <div className="space-y-4">
                        {/* Course Overview */}
                        <div className="grid grid-cols-3 gap-[1rem]">
                            <div className="col-span-2">
                                <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                                <h3>Description:</h3>
                                <p className="text-gray-600">{course.description}</p>
                            </div>
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                    <FaStar color="var(--primary-yellow)" size={24}/>
                                    <span className="text-xl">{courseStats?.averageRating || 'N/A'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <FaUserGraduate color="var(--primary-blue)" size={24}/>
                                    <span className="text-xl">{courseStats?.enrollmentsCount || 0} Enrolled</span>
                                </div>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            {/* Instructor Details */}
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold mb-2 flex items-center gap-[0.5rem]">
                                    <FaChalkboardTeacher className="mr-2" color="var(--primary-blue)"/>
                                    Instructor Details
                                </h4>
                                <p><strong>Name:</strong> {course.users.first_name} {course.users.last_name}</p>
                                <p><strong>Email:</strong> {course.users.email}</p>
                            </div>
                            {/* Category Details */}
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <h4 className="text-lg font-semibold mb-2 flex items-center gap-[0.5rem]">
                                    <FaBook className="mr-2" color="var(--primary-blue)"/>
                                    Category
                                </h4>
                                <p><strong>Category:</strong> {category}</p>
                                <p><strong>Sub-category:</strong> {subCategory}</p>
                            </div>
                        </div>

                        {/* Course Details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <h4 className="text-lg font-semibold mb-2">Course Overview</h4>
                                <p>{course.overview}</p>
                            </div>
                            <div>
                                <h4 className="text-lg font-semibold mb-2">Requirements</h4>
                                <ul className="list-disc list-inside">
                                    {course.requirements?.map((req, index) => (
                                        <li key={index}>{req}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Media */}
                        {course.media && (
                            <div className="mt-4">
                                <h4 className="text-lg font-semibold mb-2">Media</h4>
                                <div className="grid grid-cols-3 gap-4">
                                    {course.media.image && (
                                        <img 
                                            src={course.media.image} 
                                            alt="Course" 
                                            className="w-full h-auto rounded-lg"
                                        />
                                    )}
                                    {course.media.video && (
                                        <iframe 
                                            src={course.media.video} 
                                            title="Course Video" 
                                            className="w-full h-[200px] rounded-lg"
                                        />
                                    )}
                                    {course.media.pdf && (
                                        <div className="bg-gray-100 p-4 rounded-lg">
                                            <p>{course.media.pdf}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Reviews Section */}
                        <div className="mt-4">
                            <h4 className="text-lg font-semibold mb-2 flex items-center">
                                <FaComment className="mr-2" color="var(--primary-blue)"/>
                                Course Reviews ({reviews.length})
                            </h4>
                            {reviews.length > 0 ? (
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div 
                                            key={review.id} 
                                            className="bg-gray-100 p-4 rounded-lg"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <div className="flex items-center gap-2">
                                                    <strong>{review.users.first_name} {review.users.last_name}</strong>
                                                    <div className="flex">
                                                        {renderStars(review.rating)}
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p>{review.review_text}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No reviews yet</p>
                            )}
                        </div>

                        {/* Enrollments Section */}
                        <div className="mt-4">
                            <h4 className="text-lg font-semibold mb-2 flex items-center">
                                <FaUserGraduate className="mr-2" color="var(--primary-blue)"/>
                                Enrolled Students ({enrollments.length})
                            </h4>
                            {enrollments.length > 0 ? (
                                <table className="w-full bg-gray-100 rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-200">
                                            <th className="p-2 text-left">Name</th>
                                            <th className="p-2 text-left">Email</th>
                                            <th className="p-2 text-left">Enrollment Status</th>
                                            <th className="p-2 text-left">Enrolled At</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {enrollments.map((enrollment) => (
                                            <tr key={enrollment.id} className="border-b border-gray-300">
                                                <td className="p-2">
                                                    {enrollment.users.first_name} {enrollment.users.last_name}
                                                </td>
                                                <td className="p-2">{enrollment.users.email}</td>
                                                <td className="p-2">
                                                    <span className={`
                                                        px-2 py-1 rounded-full text-xs
                                                        ${enrollment.status === 'completed' 
                                                            ? 'bg-green-200 text-green-800' 
                                                            : 'bg-blue-200 text-blue-800'
                                                        }
                                                    `}>
                                                        {enrollment.status}
                                                    </span>
                                                </td>
                                                <td className="p-2">
                                                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500">No students enrolled yet</p>
                            )}
                        </div>

                        {/* Close Button */}
                        <div className="flex justify-center mt-6">
                            <button 
                                onClick={onClose} 
                                className="bg-[var(--primary-blue)] text-white px-4 py-2 rounded-[0.3rem]"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-red-500">Course not found</p>
                )}
            </div>
        </div>
    );
};

CourseDetailModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    courseId: PropTypes.string,
    courseStats: PropTypes.object
};

export default CourseDetailModal;