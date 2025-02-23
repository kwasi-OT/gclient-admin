import { useState, useEffect } from "react";    
import { useNavigate } from "react-router-dom";
import { supabase } from "../server/supabaseClient";
import Logo from "../assets/footer-logo.png"
import { HiOutlineUserCircle } from "react-icons/hi2";
import { HiOutlineUserGroup } from "react-icons/hi";

export default function AdminDashboard() {
    const [students, setStudents] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function checkAuth() {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                navigate("/");
                return;
            }
        
            // Fetch user role from database
            const { data: userData } = await supabase
                .from("users")
                .select("*")
                .eq("id", user.id)
                .single();
        
            if (userData?.role !== "admin") {
                alert("Access Denied!");
                await supabase.auth.signOut();
                navigate("/");
                return;
            }

            // console.log(user);
            setUserProfile(userData);
            setUser(user);
        }
        checkAuth();
    }, [navigate]);

    
    useEffect(() => {
        fetchData();
    }, []);

    if (!user) return null;

    async function fetchData() {
        const { data: studentsData } = await supabase.from("users").select("*").eq("role", "student");
        const { data: instructorsData } = await supabase.from("users").select("*").eq("role", "instructor");
        const { data: coursesData } = await supabase.from("courses").select("*");
        const { data: categoriesData } = await supabase.from("categories").select("*");

        setStudents(studentsData || []);
        setInstructors(instructorsData || []);
        setCourses(coursesData || []);
        setCategories(categoriesData || []);
    }

    async function deleteStudent(id) {
        await supabase.from("students").delete().eq("id", id);
        fetchData();
    }

    async function deleteInstructor(id) {
        await supabase.from("instructors").delete().eq("id", id);
        fetchData();
    }

    async function deleteCourse(id) {
        await supabase.from("courses").delete().eq("id", id);
        fetchData();
    }

    async function deleteCategory(id) {
        await supabase.from("categories").delete().eq("id", id);
        fetchData();
    }

    async function handleLogout() {
        await supabase.auth.signOut();
        navigate("/");
    }

    return (
        <div className="w-full flex justify-between items-center h-[100vh] min-h-screen p-6 bg-[var(--bg-white)]">
            <div className="sidebar w-[15%] h-full flex flex-col items-center justify-start bg-[var(--primary-blue)]">
                <div className="logo w-[100%] h-[10%] flex flex-col items-center justify-center">
                    <img src={Logo} alt="Gclient Logo" className="w-[50%] h-[50%] object-contain" />
                </div>
                <div className="divider w-[100%] h-[1px] bg-[var(--primary-grey)]"></div>
            </div>
            <div className="main w-[85%] h-full flex flex-col items-center justify-between">
                <div className="header w-[100%] h-[10%] flex flex-col items-center justify-center border-b border-[var(--primary-grey)]">
                    <div className="header-container w-[90%] h-[100%] flex items-center justify-between">
                        <div className="date flex gap-[1rem] items-start">
                            {/* todays date and current time */}
                            <p>{new Date().toLocaleDateString()}</p>
                            <p>{new Date().toLocaleTimeString()}</p>
                        </div>
                        <div className="search w-[50%] h-[50%] border border-[var(--primary-grey)] rounded-[1rem]"></div>
                        <div className="user-profile w-[10%] h-[50%] flex items-center justify-end">
                            {userProfile.profile_picture ? 
                                <img src={userProfile.profile_picture} alt="User Profile" className="w-[100%] h-[100%] object-cover rounded-[50%]" />
                                : <HiOutlineUserCircle size={35} color="var(--primary-blue)"/>
                            }
                        </div>
                    </div>
                </div>
                <div className="content w-[90%] h-[90%] flex flex-col items-center justify-between">
                    <div className="top w-[100%] h-[10%]">
                        <h3>Welcome back, {userProfile.first_name}!</h3>
                    </div>
                    <div className="bottom w-[100%] h-[90%]">
                        <div className="bottom-top w-[100%] h-[33%] flex items-center justify-between">
                            <div className="card w-[30%] h-[100%] flex flex-col justify-between items-center shadow-(--shadow-md) border border-[var(--primary-grey)] bg-[var(--student-card-bg)] rounded-[1rem]">
                                <div className="card-top flex items-center justify-between w-[100%] h-[60%] p-[1rem] box-border ">
                                    <div className="left w-[30%] h-[100%] flex flex-col items-center justify-center bg-[var(--student-card-icon-bg)] rounded-[1rem]">
                                        <HiOutlineUserGroup size={30} color="var(--bg-white)"/>
                                    </div>
                                    <div className="right w-[50%] h-[100%]">
                                        <h3 className="text-[var(--bg-white)]">Total Students</h3>
                                    </div>
                                </div>
                                <div className="card-bottom w-[100%] h-[30%]">

                                </div>
                            </div>
                            <div className="card w-[30%] h-[100%] shadow-(--shadow-md) border border-[var(--primary-grey)] rounded-[1rem]">
                                <div className="card-top w-[100%] h-[70%]"></div>
                                <div className="card-bottom w-[100%] h-[30%]"></div>
                            </div>
                        </div>
                        <div className="bottom-middle"></div>
                        <div className="bottom-bottom"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

