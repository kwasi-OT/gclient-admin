import { useState, useEffect } from 'react';
import { supabase } from '../server/supabaseClient';
import toast from 'react-hot-toast';
import PropTypes from 'prop-types';
import { BeatLoader } from 'react-spinners';

const CategoryModal = ({ isOpen, onClose, category, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);

    // Reset form when modal opens or closes
    useEffect(() => {
        if (isOpen) {
            if (category) {
                // Editing existing category
                setFormData({
                    name: category.name || '',
                    description: category.description || ''
                });
            } else {
                // Adding new category
                setFormData({
                    name: '',
                    description: ''
                });
            }
        }
    }, [isOpen, category]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const categoryData = {
                ...formData,
                created_at: new Date().toISOString()
            };

            let result;
            if (category) {
                // Update existing category
                result = await supabase
                    .from('categories')
                    .update(categoryData)
                    .eq('id', category.id);
                
                toast.success('Category updated successfully');
            } else {
                // Create new category
                result = await supabase
                    .from('categories')
                    .insert(categoryData);
                
                toast.success('Category added successfully');
            }

            if (result.error) {
                console.error('Error saving category:', result.error);
                toast.error('Failed to save category');
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
        <div className="w-[25%] h-fit min-h-[50%] fixed right-[10%] top-[25%] flex items-center justify-center bg-[var(--primary-grey)] opacity-95 shadow-[var(--shadow-md)]">
            <div className="w-[80%] h-[80%] flex flex-col items-center justify-center bg-[var(--bg-white)] p-[1rem] rounded-[0.3rem]">
                <h2 className="text-2xl mb-4 text-center">
                    {category ? 'Edit Category' : 'Add New Category'}
                </h2>
                <form onSubmit={handleSubmit} className='w-[80%] flex flex-col justify-center gap-[1rem]'>
                    <div className="mb-4">
                        <label className="block mb-1 text-[0.85rem]">Category Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)]"
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-1 text-[0.85rem]">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="border border-[var(--primary-grey)] rounded-[0.3rem] p-[0.3rem] w-full bg-[var(--input-bg)] text-[var(--input-text)] min-h-[100px]"
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
                            {loading ? <BeatLoader size={6} color="white" /> : category ? 'Update' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

CategoryModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    category: PropTypes.object,
    onSave: PropTypes.func.isRequired
};

export default CategoryModal;