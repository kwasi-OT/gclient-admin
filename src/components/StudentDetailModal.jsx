import { useState, useEffect } from 'react';
import { supabase } from '../server/supabaseClient';
import AvatarPlaceholder from '../assets/avatar.jpg';
import { IoClose } from 'react-icons/io5';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import "react-loading-skeleton/dist/skeleton.css";

const StudentDetailModal = ({ isOpen, onClose, studentId }) => {
    const [student, setStudent] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            if (!isOpen || !studentId) return;

            setLoading(true);
            try {
                // Fetch user details
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', studentId)
                    .single();

                if (userError) throw userError;

                // Fetch student profile
                const { data: profileData, error: profileError } = await supabase
                    .from('student_profiles')
                    .select('*')
                    .eq('user_id', studentId)
                    .single();

                // Fetch student's courses
                const { data: coursesData, error: coursesError } = await supabase
                    .from('enrollments')
                    .select('*')
                    .eq('student_id', studentId);

                if (profileError) console.warn('No profile found');
                if (coursesError) throw coursesError;

                setStudent(userData);
                setStudentProfile(profileData);
                setCourses(coursesData || []);
            } catch (error) {
                console.error('Error fetching student details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDetails();
    }, [isOpen, studentId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-[0] bg-[var(--primary-grey)] opacity-95 flex items-center justify-center z-50">
            <div className="bg-[var(--bg-white)] w-[90%] max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[0.3rem] shadow-[var(--shadow-md)] p-[1rem] relative">
                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-[1rem] text-gray-600 hover:text-gray-900 bg-[var(--primary-blue)]"
                >
                    <IoClose size={30} />
                </button>

                <div className="flex flex-col md:flex-row gap-6">
                    {/* Profile Image and Basic Info */}
                    <div className="w-full md:w-1/3 flex flex-col items-center">
                        {
                            loading ? 
                            <Skeleton circle width={128} height={128} />
                            :
                            <img 
                                src={student.profile_picture || AvatarPlaceholder} 
                                alt={`${student.first_name} ${student.last_name}`} 
                                className="w-[8rem] h-[8rem] rounded-full object-cover mb-4"
                            />
                        }
                        {
                            loading ? 
                            <Skeleton width={200} height={20} />
                            :
                            <h2 className="text-2xl font-bold">{`${student.first_name} ${student.last_name}`}</h2>
                        }
                        {
                            loading ? 
                            <Skeleton width={200} height={20} />
                            :
                            <p className="text-gray-600 mt-[-1rem]">{student.email}</p>
                        }
                    </div>

                    {/* Detailed Information */}
                    <div className="w-full md:w-2/3">
                        {loading ? 
                            <Skeleton width={200} height={20} />
                            :
                            <h3 className="text-xl font-semibold mb-4">Student Profile</h3>
                        }
                        {loading ? 
                            (
                                <Skeleton count={4} width={200} height={20} />
                            )
                            :
                            (   
                                <>
                                    {studentProfile && (
                                        <div className="space-y-2">
                                            {studentProfile.age && (
                                                <div>
                                                    <strong>Age:</strong>
                                                    <p>{studentProfile.age}</p>
                                                </div>
                                            )}

                                            {studentProfile.gender && (
                                                <div>
                                                    <strong>Gender:</strong>
                                                    <p>{studentProfile.gender}</p>
                                                </div>
                                            )}

                                            {studentProfile.country && (
                                                <div>
                                                    <strong>Country:</strong>
                                                    <p>{studentProfile.country}</p>
                                                </div>
                                            )}

                                            {studentProfile.city && (
                                                <div>
                                                    <strong>City:</strong>
                                                    <p>{studentProfile.city}</p>
                                                </div>
                                            )}

                                            {studentProfile.address && (
                                                <div>
                                                    <strong>Address :</strong>
                                                    <p>{studentProfile.address}</p>
                                                </div>
                                            )}

                                            {studentProfile.phone_number && (
                                                <div>
                                                    <strong>Phone Number:</strong>
                                                    <p>{studentProfile.phone_number}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )
                        }
                    </div>
                </div>

                {/* Courses Section */}
                {loading ? 
                    <Skeleton count={4} width={200} height={20} />
                    :
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-4">Preferred Courses ({courses.length})</h3>
                        {courses.length > 0 ? (
                            <div className="grid md:grid-cols-2 gap-4">
                                {courses.map((course) => (
                                    <div 
                                        key={course.id} 
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <h4 className="font-semibold text-lg">{course.title}</h4>
                                        <p className="text-gray-600 text-sm">{course.description}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No courses yet</p>
                        )}
                    </div>
                }
            </div>
        </div>
    );
};

StudentDetailModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    studentId: PropTypes.string.isRequired,
};

export default StudentDetailModal;