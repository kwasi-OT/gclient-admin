import { useState, useEffect } from 'react';
import { supabase } from '../server/supabaseClient';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const InstructorModal = ({ isOpen, onClose, instructor, onSave }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [profilePicture, setProfilePicture] = useState('');

    useEffect(() => {
        if (instructor) {
            setFirstName(instructor.first_name);
            setLastName(instructor.last_name);
            setEmail(instructor.email);
            setProfilePicture(instructor.profile_picture);
        } else {
            setFirstName('');
            setLastName('');
            setEmail('');
            setProfilePicture('');
        }
    }, [instructor]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (instructor) {
            // Update existing instructor
            const { error } = await supabase
                .from('users')
                .update({ first_name: firstName, last_name: lastName, email: email, profile_picture: profilePicture })
                .eq('id', instructor.id);
            if (error) console.error('Error updating instructor:', error);
            if (error) toast.error('Error updating instructor');
            if (!error) toast.success('Instructor updated successfully');
        } else {
            // Add new instructor
            const { error } = await supabase
                .from('users')
                .insert([{ first_name: firstName, last_name: lastName, email: email, profile_picture: profilePicture, role: 'instructor' }]);
            if (error) console.error('Error adding instructor:', error);
            if (error) toast.error('Error adding instructor');
            if (!error) toast.success('Instructor added successfully');
        }
        onSave(); // Refresh the instructor list
        onClose(); // Close the modal
    };

    if (!isOpen) return null;

    return (
        <div className="w-[25%] h-fit min-h-[70%] fixed right-[10%] top-[25%] flex items-center justify-center bg-[var(--primary-grey)] opacity-95 shadow-[var(--shadow-md)]">
            <div className="w-[80%] h-[80%] flex flex-col items-center justify-center bg-[var(--bg-white)] p-[1rem] rounded-[0.3rem]">
                <h2 className="text-xl font-bold mb-4">{instructor ? 'Edit Instructor' : 'Add Instructor'}</h2>
                <form onSubmit={handleSubmit} className='w-[80%] flex flex-col justify-center gap-[1rem]'>
                    <div className="mb-4">
                        <label className="block mb-1 text-[0.85rem]">First Name</label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                            className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-[0.85rem]">Last Name</label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                            className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-[0.85rem]">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-[0.85rem]">Profile Picture</label>
                        <input
                            type="file"
                            onChange={(e) => setProfilePicture(e.target.files[0])}
                            className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                        />
                    </div>
                    <div className="flex justify-center gap-[1rem]">
                        <button type="button" onClick={onClose} className="mr-2 bg-[var(--primary-blue)] hover:bg-[var(--logo-blue)] px-4 py-2 rounded-[0.3rem]">Cancel</button>
                        <button type="submit" className="bg-[var(--primary-blue)] hover:bg-[var(--logo-blue)] text-white px-4 py-2 rounded-[0.3rem]">{instructor ? 'Update' : 'Add'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

InstructorModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    instructor: PropTypes.object,
    onSave: PropTypes.func.isRequired
};

export default InstructorModal;