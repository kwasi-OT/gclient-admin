import { useEffect, useState, useCallback } from "react";
import { supabase } from "../server/supabaseClient"
import { MdOutlinePersonAddAlt } from "react-icons/md";
import { IoAddOutline } from "react-icons/io5";
import CategoryModal from "./CategoryModal";
import SubCategoryModal from "./SubCategoryModal";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import AlertModal from "./AlertModal";
import { MdOutlineEdit } from "react-icons/md";
import { ImBin } from "react-icons/im";
import { IoEyeOutline } from "react-icons/io5";
import CategoryDetailModal from "./CategoryDetailModal";
import { MdOutlineChevronLeft, MdOutlineChevronRight } from "react-icons/md";

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [subCategories, setSubCategories] = useState({});
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [categoriesPerPage] = useState(6);
    const [totalCategories, setTotalCategories] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubCategory] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isSubCategoryModalOpen, setSubCategoryModalOpen] = useState(false);
    const [isAlertModalOpen, setAlertModalOpen] = useState(false);
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [isDetailModalOpen, setDetailModalOpen] = useState(false);

    // Fetch categories and their sub-categories
    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            // Get total count of non-archived categories
            const { count: totalCount, error: countError } = await supabase
                .from("categories")
                .select('*', { count: 'exact' })
                .eq('archived', false);

            if (countError) {
                console.error("Error fetching category count:", countError);
                setLoading(false);
                return;
            }

            // Fetch paginated categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from("categories")
                .select("*")
                .eq('archived', false)
                .range((currentPage - 1) * categoriesPerPage, (currentPage * categoriesPerPage) - 1)
                .order('created_at', { ascending: false });
            
            if (categoriesError) {
                console.error("Error fetching categories", categoriesError);
                setLoading(false);
                return;
            }

            // Fetch sub-categories for each category
            const subCategoriesMap = {};
            for (let category of categoriesData) {
                const { data: subCats, error: subCatsError } = await supabase
                    .from("sub_categories")
                    .select("*")
                    .eq('category_id', category.id)
                    .eq('archived', false);

                if (subCatsError) {
                    console.error(`Error fetching sub-categories for ${category.name}:`, subCatsError);
                    continue;
                }

                subCategoriesMap[category.id] = subCats;
            }

            setCategories(categoriesData || []);
            setSubCategories(subCategoriesMap);
            setTotalCategories(totalCount || 0);
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
        }
    }, [currentPage, categoriesPerPage]);

    useEffect(() => {
        fetchCategories()
    }, [currentPage, fetchCategories]);

    const handleView = (id) => {
        setSelectedCategoryId(id);
        setDetailModalOpen(true);
    };

    const handleEdit = (id) => {
        setSelectedCategory(categories.find((category) => category.id === id));
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        setSelectedCategory(categories.find((category) => category.id === id));
        setAlertModalOpen(true);
    };

    const handleAddCategory = () => {
        setSelectedCategory(null);
        setModalOpen(true);
    };

    const handleAddSubCategory = (categoryId) => {
        setSelectedCategory(categories.find((category) => category.id === categoryId));
        setSubCategoryModalOpen(true);
    };

    // Calculate total pages
    const totalPages = Math.ceil(totalCategories / categoriesPerPage);

    return (
        <div className="w-full flex flex-col gap-[1rem]">
            <div className="flex justify-end mb-4">
                {loading ? 
                    <Skeleton count={1} width={200} height={40}/> 
                    : 
                    <button onClick={handleAddCategory} className="bg-[var(--primary-blue)] text-[1.2rem] text-[white] px-4 py-2 rounded-[0.3rem] flex items-center gap-[.5rem]">
                        Add Category 
                        <MdOutlinePersonAddAlt size={25}/>
                    </button>
                }
            </div>
            {loading ? (
                <Skeleton count={10} height={40}/>
            ) : (
                <table className="w-full bg-[var(--input-bg)]">
                    <thead>
                        <tr>
                            <th className="px-[1rem] py-[1rem]">Category Name</th>
                            <th className="px-[1rem] py-[1rem]">Sub-Categories</th>
                            <th className="px-[1rem] py-[1rem]">Date Created</th>
                            <th className="px-[1rem] py-[1rem]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {categories.map((category) => (
                            <tr key={category.id}>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem]">{category.name}</td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem]">
                                    <div className="flex flex-wrap gap-[1rem]">
                                        {subCategories[category.id]?.map((subCat) => (
                                            <span 
                                                key={subCat.id} 
                                                className="bg-[var(--light-blue)] text-[var(--primary-blue)] px-[1.6rem] py-[0.5rem] rounded-full text-xs"
                                            >
                                                {subCat.name}
                                            </span>
                                        ))}
                                        <button 
                                            onClick={() => handleAddSubCategory(category.id)}
                                            className="bg-[var(--primary-blue)] text-white px-[0.5rem] py-[0.5rem] rounded-full"
                                            title="Add Sub-Category"
                                        >
                                            <IoAddOutline size={16}/>
                                        </button>
                                    </div>
                                </td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem]">{new Date(category.created_at).toLocaleDateString()}</td>
                                <td className="bg-[var(--bg-white)] px-[1rem] py-[0.8rem] text-center">
                                    <button onClick={() => handleView(category.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] mr-[0.5rem] bg-[var(--light-blue)]">
                                        <IoEyeOutline size={25} color="var(--primary-blue)"/></button>
                                    <button onClick={() => handleEdit(category.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] mr-[0.5rem] bg-[var(--input-active-bg)]">
                                        <MdOutlineEdit size={25} color="var(--primary-lemon-green)"/></button>
                                    <button onClick={() => handleDelete(category.id)} className="rounded-[0.3rem] py-[0.8rem] px-[0.8rem] bg-[var(--input-error-bg)]">
                                        <ImBin size={25} color="var(--primary-red)"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-[0.5rem] mt-[2rem] space-x-2">
                    <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-[var(--light-blue)] rounded-[0.3rem] disabled:opacity-50"
                    >
                        <MdOutlineChevronLeft size={25} color="var(--primary-blue)"/>
                    </button>

                    {[...Array(totalPages)].map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(index + 1)}
                            className={`px-4 py-2 rounded ${
                                currentPage === index + 1 
                                    ? 'bg-[var(--placeholder-grey)] text-[var(--text-grey)]' 
                                    : 'bg-[var(--bg-white)] text-[var(--primary-black)]'
                            }`}
                        >
                            {index + 1}
                        </button>
                    ))}

                    <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-[var(--light-blue)] rounded-[0.3rem] disabled:opacity-50"
                    >
                        <MdOutlineChevronRight size={25} color="var(--primary-blue)"/>
                    </button>
                </div>
            )}
            {/* Category Modal */}
            <CategoryModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)} 
                category={selectedCategory} 
                onSave={fetchCategories} 
            />

            {/* Sub-Category Modal */}
            <SubCategoryModal 
                isOpen={isSubCategoryModalOpen} 
                onClose={() => setSubCategoryModalOpen(false)} 
                category={selectedCategory}
                subCategory={selectedSubCategory} 
                onSave={fetchCategories} 
            />

            {/* Alert Modal */}
            <AlertModal 
                isOpen={isAlertModalOpen} 
                onClose={() => setAlertModalOpen(false)} 
                onConfirm={fetchCategories} 
                category={selectedCategory} 
            />

            {/* Category Detail Modal */}
            <CategoryDetailModal 
                isOpen={isDetailModalOpen}
                onClose={() => setDetailModalOpen(false)}
                categoryId={selectedCategoryId}
                subCategories={subCategories[selectedCategoryId]}
            />
        </div>
    )
}

export default Categories;