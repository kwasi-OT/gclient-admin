import { supabase } from "../server/supabaseClient";
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';

const AlertModal = ({ isOpen, onClose, onConfirm, instructor, student }) => {
    const handleDelete = async (id) => {
        const { error } = await supabase.from("users").delete().eq("id", id);
        if (error) {
            console.error("Error deleting item:", error);
            toast.error("Failed to delete item");
        } else {
            toast.success("Item deleted successfully");
        }
        onConfirm();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-[0] flex flex-col items-center justify-center bg-[var(--primary-grey)] opacity-95">
            {instructor && <div className="w-[30%] h-[20%] flex flex-col items-center justify-center gap-[1rem] bg-[var(--bg-white)] rounded-[0.3rem] shadow-[var(--shadow-md)] p-[1rem]">
                <p className="text-gray-600 mb-4 flex flex-col items-center justify-center">
                    Are you sure you want to delete this instructor?
                    <span className="font-[600]">{instructor.first_name} {instructor.last_name}</span>
                </p>
                <div className="w-[100%] h-[90%] flex flex-row items-center justify-center mt-[-1.5rem] gap-[1rem]">
                    <button onClick={onClose} className="px-4 py-2 bg-[var(--primary-blue)] hover:bg-[var(--logo-blue)] rounded-md mr-2">Cancel</button>
                    <button onClick={() => handleDelete(instructor.id)} className="px-4 py-2 bg-[var(--primary-red)] hover:bg-[var(--student-card-bg)] text-white rounded-md">Delete</button>
                </div>
            </div>}
            {student && <div className="w-[30%] h-[20%] flex flex-col items-center justify-center gap-[1rem] bg-[var(--bg-white)] rounded-[0.3rem] shadow-[var(--shadow-md)] p-[1rem]">
                <p className="text-gray-600 mb-4 flex flex-col items-center justify-center">
                    Are you sure you want to delete this student?
                    <span className="font-[600]">{student.first_name} {student.last_name}</span>
                </p>
                <div className="w-[100%] h-[90%] flex flex-row items-center justify-center mt-[-1.5rem] gap-[1rem]">
                    <button onClick={onClose} className="px-4 py-2 bg-[var(--primary-blue)] hover:bg-[var(--logo-blue)] rounded-md mr-2">Cancel</button>
                    <button onClick={() => handleDelete(student.id)} className="px-4 py-2 bg-[var(--primary-red)] hover:bg-[var(--student-card-bg)] text-white rounded-md">Delete</button>
                </div>
            </div>}
        </div>
    )
}

AlertModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    instructor: PropTypes.object.isRequired,
    student: PropTypes.object.isRequired
}

export default AlertModal
