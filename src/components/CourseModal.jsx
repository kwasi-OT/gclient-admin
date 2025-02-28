import { useState, useEffect } from 'react';
import { supabase } from '../server/supabaseClient';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { BeatLoader } from 'react-spinners';
import { v4 as uuidv4 } from 'uuid';
import { FaCloudUploadAlt, FaTrash } from 'react-icons/fa';


const CourseModal = ({ isOpen, onClose, course, onSave }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        overview: '',
        requirements: [],
        price: '',
        instructor_id: null,
        media: {
            image: null,
            video: null,
            pdf: null
        }
    });
    const [loading, setLoading] = useState(false);
    const [instructors, setInstructors] = useState([]);
    const [requirementInput, setRequirementInput] = useState('');
    const [fileLoading, setFileLoading] = useState({
        image: false,
        video: false,
        pdf: false
    });

    // Fetch instructors on component mount
    useEffect(() => {
        const fetchInstructors = async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'instructor');

            if (error) {
                console.error('Error fetching instructors:', error);
            } else {
                setInstructors(data);
            }
        };

        fetchInstructors();
    }, []);

    // Reset or populate form when modal opens/changes
    useEffect(() => {
        if (isOpen) {
            if (course) {
                // Edit existing course
                setFormData({
                    title: course.title || '',
                    description: course.description || '',
                    overview: course.overview || '',
                    requirements: course.requirements || [],
                    price: course.price || '',
                    instructor_id: course.instructor_id,
                    media: course.media || {
                        image: null,
                        video: null,
                        pdf: null
                    }
                });
            } else {
                // New course
                setFormData({
                    title: '',
                    description: '',
                    overview: '',
                    requirements: [],
                    price: '',
                    instructor_id: null,
                    media: {
                        image: null,
                        video: null,
                        pdf: null
                    }
                });
            }
        }
    }, [isOpen, course]);

    // File upload handler
    const handleFileUpload = async (file, type) => {
        if (!file) return null;

        setFileLoading(prev => ({ ...prev, [type]: true }));
        try {
            // Generate a unique filename
            const fileExt = file.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `course-media/${fileName}`;

            // Upload file to Supabase storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('gclient-store')
                .upload(filePath, file);

            if (uploadData) {
                console.log(uploadData);
            }

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data: { publicUrl }, error: urlError } = supabase.storage
                .from('gclient-store')
                .getPublicUrl(filePath);

            if (urlError) {
                throw urlError;
            }

            // Update form data with file URL
            setFormData(prev => ({
                ...prev,
                media: {
                    ...prev.media,
                    [type]: publicUrl
                }
            }));

            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} uploaded successfully`);
            return publicUrl;
        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
            toast.error(`Failed to upload ${type}`);
            return null;
        } finally {
            setFileLoading(prev => ({ ...prev, [type]: false }));
        }
    };

    // File removal handler
    const handleFileRemove = async (type) => {
        try {
            // If there's an existing file, remove it from storage
            if (formData.media[type]) {
                const fileName = formData.media[type].split('/').pop();
                const { error } = await supabase.storage
                    .from('course-content')
                    .remove([`course-media/${fileName}`]);

                if (error) {
                    console.error(`Error removing ${type}:`, error);
                }
            }

            // Update form data
            setFormData(prev => ({
                ...prev,
                media: {
                    ...prev.media,
                    [type]: null
                }
            }));

            toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} removed`);
        } catch (error) {
            console.error(`Error removing ${type}:`, error);
            toast.error(`Failed to remove ${type}`);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const courseData = {
                ...formData,
                created_at: new Date().toISOString()
            };

            let result;
            if (course) {
                // Update existing course
                result = await supabase
                    .from('courses')
                    .update(courseData)
                    .eq('id', course.id);
                
                toast.success('Course updated successfully');
            } else {
                // Create new course
                result = await supabase
                    .from('courses')
                    .insert(courseData);
                
                toast.success('Course added successfully');
            }

            if (result.error) {
                console.error('Error saving course:', result.error);
                toast.error('Failed to save course');
                return;
            }

            // Refresh the list
            onSave();
            // Close the modal
            onClose();
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    const addRequirement = () => {
        if (requirementInput.trim()) {
            setFormData(prev => ({
                ...prev,
                requirements: [...prev.requirements, requirementInput.trim()]
            }));
            setRequirementInput('');
        }
    };

    const removeRequirement = (index) => {
        setFormData(prev => ({
            ...prev,
            requirements: prev.requirements.filter((_, i) => i !== index)
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="w-[50%] h-fit py-[2rem] absolute right-[15%] top-[8%] flex items-center justify-center bg-[var(--primary-grey)] opacity-95 shadow-[var(--shadow-md)]">
            <div className="w-[80%] h-[80%] flex flex-col items-center justify-center bg-[var(--bg-white)] p-[1rem] rounded-[0.3rem]">
                <h2 className="text-2xl mb-4 text-center">
                    {course ? 'Edit Course' : 'Add New Course'}
                </h2>
                <form onSubmit={handleSubmit} className='w-[95%] flex flex-col justify-center gap-[1rem]'>
                    <div className="grid grid-cols-2 gap-[1.5rem]">
                        <div className="mb-4">
                            <label className="block mb-1 text-[0.85rem]">Course Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                required
                                className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-[0.85rem]">Instructor</label>
                            <select
                                value={formData.instructor_id || ''}
                                onChange={(e) => setFormData({ ...formData, instructor_id: e.target.value })}
                                required
                                className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                            >
                                <option value="">Select Instructor</option>
                                {instructors.map(instructor => (
                                    <option key={instructor.id} value={instructor.id}>
                                        {instructor.first_name} {instructor.last_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4 col-span-2">
                            <label className="block mb-1 text-[0.85rem]">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)] h-[100px]"
                            />
                        </div>
                        <div className="mb-4 col-span-2">
                            <label className="block mb-1 text-[0.85rem]">Course Overview</label>
                            <textarea
                                value={formData.overview}
                                onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                                className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)] h-[150px]"
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block mb-1 text-[0.85rem]">Price ($)</label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                                min="0"
                                step="0.01"
                                className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                            />
                        </div>
                        <div className="mb-4 col-span-2">
                            <label className="block mb-1 text-[0.85rem]">Course Requirements</label>
                            <div className="flex">
                                <input
                                    type="text"
                                    value={requirementInput}
                                    onChange={(e) => setRequirementInput(e.target.value)}
                                    className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                                    placeholder="Add requirement"
                                />
                                <button 
                                    type="button"
                                    onClick={addRequirement}
                                    className="ml-2 bg-[var(--primary-blue)] text-white px-3 py-2 rounded-[0.3rem]"
                                >
                                    Add
                                </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {formData.requirements.map((req, index) => (
                                    <span 
                                        key={index} 
                                        className="bg-[var(--light-blue)] text-[var(--primary-blue)] px-2 py-1 rounded-full text-xs flex items-center"
                                    >
                                        {req}
                                        <button 
                                            type="button"
                                            onClick={() => removeRequirement(index)}
                                            className="ml-2 text-[var(--primary-red)]"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div> 
                    <div className="mb-4 col-span-2">
                        <label className="block mb-1 text-[0.85rem]">Course Media</label>
                        <div className="flex flex-col gap-[0.8rem]">
                            {/* Image Upload */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    id="imageUpload"
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e.target.files[0], 'image')}
                                    className="hidden"
                                />
                                <label 
                                    htmlFor="imageUpload" 
                                    className="flex items-center gap-2 cursor-pointer bg-[var(--light-blue)] text-[var(--primary-blue)] px-3 py-2 rounded-[0.3rem]"
                                >
                                    {fileLoading.image ? (
                                        <BeatLoader size={6} color="var(--primary-blue)" />
                                    ) : (
                                        <>
                                            <FaCloudUploadAlt />
                                            Upload Image
                                        </>
                                    )}
                                </label>
                                {formData.media.image && (
                                    <div className="flex items-center gap-2">
                                        <a 
                                            href={formData.media.image} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-[var(--primary-blue)] underline"
                                        >
                                            View Image
                                        </a>
                                        <button 
                                            type="button"
                                            onClick={() => handleFileRemove('image')}
                                            className="text-[var(--primary-red)]"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Video Upload */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    id="videoUpload"
                                    accept="video/*"
                                    onChange={(e) => handleFileUpload(e.target.files[0], 'video')}
                                    className="hidden"
                                />
                                <label 
                                    htmlFor="videoUpload" 
                                    className="flex items-center gap-2 cursor-pointer bg-[var(--light-blue)] text-[var(--primary-blue)] px-3 py-2 rounded-[0.3rem]"
                                >
                                    {fileLoading.video ? (
                                        <BeatLoader size={6} color="var(--primary-blue)" />
                                    ) : (
                                        <>
                                            <FaCloudUploadAlt />
                                            Upload Video
                                        </>
                                    )}
                                </label>
                                {formData.media.video && (
                                    <div className="flex items-center gap-2">
                                        <a 
                                            href={formData.media.video} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-[var(--primary-blue)] underline"
                                        >
                                            View Video
                                        </a>
                                        <button 
                                            type="button"
                                            onClick={() => handleFileRemove('video')}
                                            className="text-[var(--primary-red)]"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* PDF Upload */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="file"
                                    id="pdfUpload"
                                    accept=".pdf"
                                    onChange={(e) => handleFileUpload(e.target.files[0], 'pdf')}
                                    className="hidden"
                                />
                                <label 
                                    htmlFor="pdfUpload" 
                                    className="flex items-center gap-2 cursor-pointer bg-[var(--light-blue)] text-[var(--primary-blue)] px-3 py-2 rounded-[0.3rem]"
                                >
                                    {fileLoading.pdf ? (
                                        <BeatLoader size={6} color="var(--primary-blue)" />
                                    ) : (
                                        <>
                                            <FaCloudUploadAlt />
                                            Upload PDF
                                        </>
                                    )}
                                </label>
                                {formData.media.pdf && (
                                    <div className="flex items-center gap-2">
                                        <a 
                                            href={formData.media.pdf} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="text-[var(--primary-blue)] underline"
                                        >
                                            View PDF
                                        </a>
                                        <button 
                                            type="button"
                                            onClick={() => handleFileRemove('pdf')}
                                            className="text-[var(--primary-red)]"
                                        >
                                            <FaTrash />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center gap-[1rem] mt-4">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="mr-2 bg-[var(--primary-blue)] hover:bg-[var(--logo-blue)] px-4 py-2 rounded-[0.3rem]"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="bg-[var(--primary-blue)] hover:bg-[var(--logo-blue)] text-white px-4 py-2 rounded-[0.3rem]" 
                            disabled={loading}
                        >
                            {loading ? <BeatLoader size={6} color="white" /> : (course ? 'Update' : 'Add')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

CourseModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    course: PropTypes.object,
    onSave: PropTypes.func.isRequired
};

export default CourseModal;