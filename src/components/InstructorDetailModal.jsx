import { useState, useEffect } from 'react';
import { supabase } from '../server/supabaseClient';
import AvatarPlaceholder from '../assets/avatar.jpg';
import { IoClose } from 'react-icons/io5';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import "react-loading-skeleton/dist/skeleton.css";

const InstructorDetailModal = ({ isOpen, onClose, instructorId }) => {
    const [instructor, setInstructor] = useState(null);
    const [instructorProfile, setInstructorProfile] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInstructorDetails = async () => {
            if (!isOpen || !instructorId) return;

            setLoading(true);
            try {
                // Fetch user details
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', instructorId)
                    .single();

                if (userError) throw userError;

                // Fetch instructor profile
                const { data: profileData, error: profileError } = await supabase
                    .from('instructor_profiles')
                    .select('*')
                    .eq('user_id', instructorId)
                    .single();

                // Fetch instructor's courses
                const { data: coursesData, error: coursesError } = await supabase
                    .from('courses')
                    .select('*')
                    .eq('instructor_id', instructorId);

                if (profileError) console.warn('No profile found');
                if (coursesError) throw coursesError;

                setInstructor(userData);
                setInstructorProfile(profileData);
                setCourses(coursesData || []);
            } catch (error) {
                console.error('Error fetching instructor details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchInstructorDetails();
    }, [isOpen, instructorId]);

    if (!isOpen) return null;

    // if (loading) {
    //     return (
    //         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    //             <div className="bg-white p-6 rounded-lg">
    //                 <p>Loading instructor details...</p>
    //             </div>
    //         </div>
    //     );
    // }

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
                                src={instructor.profile_picture || AvatarPlaceholder} 
                                alt={`${instructor.first_name} ${instructor.last_name}`} 
                                className="w-[15%] h-[15%] rounded-full object-cover mb-4"
                            />
                        }
                        {
                            loading ? 
                            <Skeleton width={200} height={20} />
                            :
                            <h2 className="text-2xl font-bold">{`${instructor.first_name} ${instructor.last_name}`}</h2>
                        }
                        {
                            loading ? 
                            <Skeleton width={200} height={20} />
                            :
                            <p className="text-gray-600 mt-[-1rem]">{instructor.email}</p>
                        }
                    </div>

                    {/* Detailed Information */}
                    <div className="w-full md:w-2/3">
                        {loading ? 
                            <Skeleton width={200} height={20} />
                            :
                            <h3 className="text-xl font-semibold mb-4">Instructor Profile</h3>
                        }
                        {loading ? 
                            (
                                <Skeleton count={4} width={200} height={20} />
                            )
                            :
                            (
                                <>
                                    {instructorProfile && (
                                        <div className="space-y-2">
                                            {instructorProfile.bio && (
                                                <div>
                                                    <strong>Bio:</strong>
                                                    <p>{instructorProfile.bio}</p>
                                                </div>
                                            )}

                                            {instructorProfile.education && instructorProfile.education.length > 0 && (
                                                <div>
                                                    <strong>Education:</strong>
                                                    <ul className="list-disc list-inside">
                                                        {instructorProfile.education.map((edu, index) => (
                                                            <li key={index}>{edu}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {instructorProfile.skills && instructorProfile.skills.length > 0 && (
                                                <div>
                                                    <strong>Skills:</strong>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {instructorProfile.skills.map((skill, index) => (
                                                            <span 
                                                                key={index} 
                                                                className="bg-blue-100 text-blue-800 text-sm px-2.5 py-0.5 rounded"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                    </div>
                </div>

                {/* Courses Section */}
                {loading ? 
                    <Skeleton count={4} width={200} height={20} />
                    :
                    <div className="mt-6">
                        <h3 className="text-xl font-semibold mb-4">Courses ({courses.length})</h3>
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
                            <p className="text-gray-500">No courses created yet</p>
                        )}
                    </div>
                }
            </div>
        </div>
    );
};

InstructorDetailModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    instructorId: PropTypes.string.isRequired,
};

export default InstructorDetailModal;