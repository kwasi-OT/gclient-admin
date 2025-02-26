import { supabase } from "../server/supabaseClient";
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const AlertModal = ({ isOpen, onClose, onConfirm, instructor }) => {
    const handleDelete = async (id) => {
        const { error } = await supabase.from("users").delete().eq("id", id);
        if (error) {
            console.error("Error deleting instructor:", error);
            toast.error("Failed to delete instructor");
        } else {
            toast.success("Instructor deleted successfully");
        }
        onConfirm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-[0] flex flex-col items-center justify-center bg-[var(--primary-black)] opacity-80">
            <div className="w-[30%] h-[20%] flex flex-col items-center justify-center gap-[1rem] bg-[var(--bg-white)] rounded-[0.3rem] shadow-[var(--shadow-md)] p-[1rem]">
                <p className="text-gray-600 mb-4">Are you sure you want to delete this instructor?</p>
                <div className="w-[100%] h-[100%] flex flex-row items-center justify-center gap-[1rem]">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded-md mr-2">Cancel</button>
                    <button onClick={() => handleDelete(instructor.id)} className="px-4 py-2 bg-red-500 text-white rounded-md">Delete</button>
                </div>
            </div>
        </div>
    )
}

AlertModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    instructor: PropTypes.object.isRequired
}

export default AlertModal
