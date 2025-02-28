import { useState, useEffect } from 'react';
import { supabase } from '../server/supabaseClient';
import PropTypes from 'prop-types';
import { IoClose } from 'react-icons/io5';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const CategoryDetailModal = ({ isOpen, onClose, categoryId, subCategories }) => {
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryDetails = async () => {
            if (!isOpen || !categoryId) return;

            setLoading(true);
            try {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .eq('id', categoryId)
                    .single();

                if (error) {
                    console.error('Error fetching category details:', error);
                } else {
                    setCategory(data);
                }
            } catch (error) {
                console.error('Unexpected error:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCategoryDetails();
    }, [isOpen, categoryId]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-[0] bg-[var(--primary-grey)] opacity-95 flex items-center justify-center z-50">
            <div className="bg-[var(--bg-white)] w-[90%] max-w-[800px] max-h-[90vh] overflow-y-auto rounded-[0.3rem] shadow-[var(--shadow-md)] p-[1rem] relative">
                <h2 className="text-2xl mb-4 text-center">Category Details</h2>

                <button 
                    onClick={onClose} 
                    className="absolute top-[1rem] right-[1rem] text-gray-600 hover:text-gray-900 bg-[var(--primary-blue)]"
                >
                    <IoClose size={30} />
                </button>
                
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton height={30} />
                        <Skeleton height={100} />
                        <Skeleton height={30} />
                    </div>
                ) : category ? (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-[600] text-gray-700">Category Name:</label>
                            <p className="mt-1 p-2 bg-gray-100">{category.name}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-[600] text-gray-700">Category Description:</label>
                            <p className="mt-1 p-2 bg-gray-100">{category.description}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-[600] text-gray-700">Sub-Categories:</label>
                            <div className="mt-1 p-2 bg-gray-100 min-h-[100px]">
                                {subCategories && subCategories.length > 0 ? (
                                    <div className="flex flex-wrap gap-[1rem]">
                                        {subCategories.map((subCat) => (
                                            <span 
                                                key={subCat.id} 
                                                className="bg-[var(--light-blue)] text-[var(--primary-blue)] px-[1.6rem] py-[0.5rem] rounded-full text-xs"
                                            >
                                                {subCat.name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-gray-500">No sub-categories</p>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-[600] text-gray-700">Created At:</label>
                            <p className="mt-1 p-2 bg-gray-100">
                                {new Date(category.created_at).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-red-500">Category not found</p>
                )}
            </div>
        </div>
    );
};

CategoryDetailModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    categoryId: PropTypes.string,
    subCategories: PropTypes.array
};

export default CategoryDetailModal;