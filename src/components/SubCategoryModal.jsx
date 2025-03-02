import { useState, useEffect } from 'react';
import { supabase } from '../server/supabaseClient';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { BeatLoader } from 'react-spinners';

const SubCategoryModal = ({ isOpen, onClose, category, subCategory, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        category_id: null
    });
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens or closes
    useEffect(() => {
        if (isOpen) {
            if (subCategory) {
                // Editing existing sub-category
                setFormData({
                    name: subCategory.name || '',
                    category_id: subCategory.category_id
                });
            } else {
                // Adding new sub-category
                setFormData({
                    name: '',
                    category_id: category.id
                });
            }
        }
    }, [isOpen, category, subCategory]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const subCategoryData = {
                ...formData,
                created_at: new Date().toISOString()
            };

            let result;
            if (subCategory) {
                // Update existing sub-category
                result = await supabase
                    .from('sub_categories')
                    .update(subCategoryData)
                    .eq('id', subCategory.id);
                
                toast.success('Sub-category updated successfully');
            } else {
                // Create new sub-category
                result = await supabase
                    .from('sub_categories')
                    .insert(subCategoryData);
                
                toast.success('Sub-category added successfully');
            }

            if (result.error) {
                console.error('Error saving sub-category:', result.error);
                toast.error('Failed to save sub-category');
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

    if (!isOpen) return null;

    return (
        <div className="w-fit h-fit min-h-[40%] fixed right-[25rem] top-[20rem] bg-[var(--primary-grey)] opacity-95 flex justify-center items-center shadow-[var(--shadow-md)] z-50">
            <div className="w-[80%] h-[80%] flex flex-col items-center justify-center bg-[var(--bg-white)] p-[1rem] rounded-[0.3rem]">
                <h3 className="text-2xl mb-4 text-center">
                    {subCategory ? 'Edit Sub-Category' : `Add Sub-Category to ${category.name}`}
                </h3>
                <form onSubmit={handleSubmit} className='w-[80%] flex flex-col justify-center gap-[1rem]'>
                    <div className="mb-4">
                        <label className="block mb-1 text-[0.9rem]">Sub-Category Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                        />
                    </div>
                    <div className="flex justify-center gap-[1rem]">
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
                            {loading ? <BeatLoader size={6} color="white" /> : subCategory ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

SubCategoryModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    category: PropTypes.object.isRequired,
    subCategory: PropTypes.object,
    onSave: PropTypes.func.isRequired
};

export default SubCategoryModal;