import { useState, useEffect } from 'react';
import { supabase } from '../server/supabaseClient';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { BeatLoader } from 'react-spinners';

const StudentModal = ({ isOpen, onClose, student, onSave }) => {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        profile_picture: null
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens or closes
    useEffect(() => {
        if (isOpen) {
            if (student) {
                // Editing existing student
                setFormData({
                    first_name: student.first_name || '',
                    last_name: student.last_name || '',
                    email: student.email || '',
                    profile_picture: student.profile_picture || null
                });
                setImagePreview(student.profile_picture || null);
            } else {
                // Adding new student
                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    profile_picture: null
                });
                setImagePreview(null);
            }
            // Reset image file
            setImageFile(null);
        }
    }, [isOpen, student]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!imageFile) return formData.profile_picture;

        try {
            const fileExt = imageFile.name.split('.').pop();
            const fileName = `${uuidv4()}.${fileExt}`;
            const filePath = `students/${fileName}`;

            // Upload image to Supabase storage
            const { data, error } = await supabase.storage
                .from('gclient-store')
                .upload(filePath, imageFile);

            if (data) {
                // formData.profile_picture = data.path;
                console.log(data.path)
            }

            if (error) {
                console.error('Error uploading image:', error);
                toast.error('Failed to upload image');
                return null;
            }

            // Get public URL for the uploaded image
            const { data: urlData } = supabase.storage
                .from('gclient-store')
                .getPublicUrl(filePath);

            return urlData.publicUrl;
        } catch (error) {
            console.error('Image upload error:', error);
            toast.error('Image upload failed');
            return null;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Upload image if a new file is selected
            const profilePictureUrl = imageFile 
                ? await uploadImage() 
                : formData.profile_picture;

            const studentData = {
                ...formData,
                profile_picture: profilePictureUrl,
                role: 'student'
            };

            let result;
            if (student) {
                // Update existing student
                result = await supabase
                    .from('users')
                    .update(studentData)
                    .eq('id', student.id);
                
                if (result.error) {
                    console.error('Error updating student:', result.error);
                    toast.error('Failed to update student');
                    return;
                }
                
                toast.success('Student updated successfully');
            } else {
                // Create new student
                result = await supabase
                    .from('users')
                    .insert(studentData);
                
                if (result.error) {
                    console.error('Error adding student:', result.error);
                    toast.error('Failed to add student');
                    return;
                }
                
                toast.success('Student added successfully');
            }

            // Call onSave to refresh the list
            onSave();
            
            // Close the modal
            onClose();
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('An unexpected error occurred');
        }

        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="w-[25%] h-fit min-h-[70%] fixed right-[10%] top-[25%] flex items-center justify-center bg-[var(--primary-grey)] opacity-95 shadow-[var(--shadow-md)]">
            <div className="w-[80%] h-[80%] flex flex-col items-center justify-center bg-[var(--bg-white)] p-[1rem] rounded-[0.3rem]">
                <h2 className="text-xl font-bold mb-4">{student ? 'Edit Student' : 'Add Student'}</h2>
                <form onSubmit={handleSubmit} className='w-[80%] flex flex-col justify-center gap-[1rem]'>
                <div className="mb-4 flex justify-center">
                        <label className="cursor-pointer">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <div className="w-[150px] h-[150px] rounded-full border-2 border-gray-300 flex items-center justify-center">
                                {imagePreview ? (
                                    <img 
                                        src={imagePreview} 
                                        alt="Profile Preview" 
                                        className="w-full h-full object-cover rounded-full"
                                    />
                                ) : (
                                    <span className="text-gray-500">Upload Photo</span>
                                )}
                            </div>
                        </label>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-[0.85rem]">First Name</label>
                        <input
                            type="text"
                            value={formData.first_name}
                            onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                            required
                            className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-[0.85rem]">Last Name</label>
                        <input
                            type="text"
                            value={formData.last_name}
                            onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                            required
                            className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-[0.85rem]">Email</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                        />
                    </div>
                    <div className="flex justify-center gap-[1rem]">
                        <button type="button" onClick={onClose} className="mr-2 bg-[var(--primary-blue)] hover:bg-[var(--logo-blue)] px-4 py-2 rounded-[0.3rem]">Cancel</button>
                        <button type="submit" className="bg-[var(--primary-blue)] hover:bg-[var(--logo-blue)] text-white px-4 py-2 rounded-[0.3rem]" disabled={loading}>
                            {loading ? <BeatLoader size={6} color="white" /> : student ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

StudentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    student: PropTypes.object,
    onSave: PropTypes.func.isRequired
};

export default StudentModal;