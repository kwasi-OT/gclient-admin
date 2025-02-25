import { useState, useEffect } from "react";    
import { useNavigate } from "react-router-dom";
import { supabase } from "../server/supabaseClient";
import Logo from "../assets/gclient-logo.png"
import { HiOutlineUserGroup } from "react-icons/hi";
import { GiBookshelf } from "react-icons/gi";
import { MdOutlineNotifications } from "react-icons/md";
import { RiDashboardHorizontalLine } from "react-icons/ri";
import { LiaChalkboardTeacherSolid } from "react-icons/lia";
import { MdOutlineCategory } from "react-icons/md";
import { LuSettings } from "react-icons/lu";
import { IoPower } from "react-icons/io5";
import { toast } from "react-hot-toast";
import ClockAPI from "../components/Time";
import Categories from "../components/Categories";
import Settings from "../components/Settings";
import Dashboard from "../components/Dashboard";
import Students from "../components/Students";
import Instructors from "../components/Instructors";
import Courses from "../components/Courses";

export default function AdminDashboard() {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [activeTab, setActiveTab] = useState("dashboard");
    const navigate = useNavigate();

    // handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

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

    if (!user) return null;

    async function handleLogout() {
        await supabase.auth.signOut();
        toast.success("Logout successful");
        navigate("/");
    }

    return (
        <div className="w-full flex justify-between items-center h-[100vh] min-h-screen p-6 bg-[var(--bg-white)]">
            <div className="sidebar w-[15%] h-full flex flex-col items-center justify-between bg-[var(--primary-blue)] rounded-r-[0.3rem]">
                <div className="sidebar-top w-[100%] h-[80%] flex flex-col items-center justify-start gap-[2rem]">
                    <div className="logo w-[90%] h-[15%] flex flex-col items-center justify-center bg-[var(--bg-white)] mt-[0.5rem] rounded-[0.3rem]">
                        <img src={Logo} alt="Gclient Logo" className="w-[50%] h-[50%] object-contain" />
                    </div>
                    <div className="tabs w-[90%] h-[50%] flex flex-col items-start justify-between">
                        <button onClick={() => handleTabChange('dashboard')} className={activeTab === 'dashboard' ? 'active bg-[white] text-[1rem] leading-[1.5rem] text-[var(--primary-blue)] font-[700] w-full rounded-[0.3rem] flex justify-start items-center gap-[1rem]' : 'w-full rounded-[0.3rem] bg-[var(--primary-blue)] text-[1rem] leading-[1.5rem] text-[white] flex justify-start items-center gap-[1rem]'}>
                            {activeTab === 'dashboard' ? <RiDashboardHorizontalLine size={24} color="var(--primary-blue)"/> : <RiDashboardHorizontalLine size={24} color="white"/>}
                            Dashboard
                        </button>
                        <button onClick={() => handleTabChange('instructors')} className={activeTab === 'instructors' ? 'active bg-[white] text-[1rem] leading-[1.5rem] text-[var(--primary-blue)] font-[700] w-full rounded-[0.3rem] flex justify-start items-center gap-[1rem]' : 'w-full rounded-[0.3rem] bg-[var(--primary-blue)] text-[1rem] leading-[1.5rem] text-[white] flex justify-start items-center gap-[1rem]'}>
                            {activeTab === 'instructors' ? <LiaChalkboardTeacherSolid size={24} color="var(--primary-blue)"/> : <LiaChalkboardTeacherSolid size={24} color="white"/>}
                            Instructors
                        </button>
                        <button onClick={() => handleTabChange('students')} className={activeTab === 'students' ? 'active bg-[white] text-[1rem] leading-[1.5rem] text-[var(--primary-blue)] font-[700] w-full rounded-[0.3rem] flex justify-start items-center gap-[1rem]' : 'w-full rounded-[0.3rem] bg-[var(--primary-blue)] text-[1rem] leading-[1.5rem] text-[white] flex justify-start items-center gap-[1rem]'}>
                            {activeTab === 'students' ? <HiOutlineUserGroup size={24} color="var(--primary-blue)"/> : <HiOutlineUserGroup size={24} color="white"/>}
                            Students
                        </button>
                        <button onClick={() => handleTabChange('courses')} className={activeTab === 'courses' ? 'active bg-[white] text-[1rem] leading-[1.5rem] text-[var(--primary-blue)] font-[700] w-full rounded-[0.3rem] flex justify-start items-center gap-[1rem]' : 'w-full rounded-[0.3rem] bg-[var(--primary-blue)] text-[1rem] leading-[1.5rem] text-[white] flex justify-start items-center gap-[1rem]'}>
                            {activeTab === 'courses' ? <GiBookshelf size={24} color="var(--primary-blue)"/> : <GiBookshelf size={24} color="white"/>}
                            Courses
                        </button>
                        <button onClick={() => handleTabChange('categories')} className={activeTab === 'categories' ? 'active bg-[white] text-[1rem] leading-[1.5rem] text-[var(--primary-blue)] font-[700] w-full rounded-[0.3rem] flex justify-start items-center gap-[1rem]' : 'w-full rounded-[0.3rem] bg-[var(--primary-blue)] text-[1rem] leading-[1.5rem] text-[white] flex justify-start items-center gap-[1rem]'}>
                            {activeTab === 'categories' ? <MdOutlineCategory size={24} color="var(--primary-blue)"/> : <MdOutlineCategory size={24} color="white"/>}
                            Categories
                        </button>
                    </div>
                </div>
                <div className="sidebar-bottom w-[90%] h-[20%] flex flex-col items-start justify-start mb-[1rem]">
                    <button onClick={() => handleTabChange('settings')} className={activeTab === 'settings' ? 'active bg-[white] text-[1rem] leading-[1.5rem] text-[var(--primary-blue)] font-[700] w-full rounded-[0.3rem] flex justify-start items-center gap-[1rem]' : 'w-full rounded-[0.3rem] bg-[var(--primary-blue)] text-[1rem] leading-[1.5rem] text-[white] flex justify-start items-center gap-[1rem]'}>
                    {activeTab === 'settings' ? <LuSettings size={24} color="var(--primary-blue)"/> : <LuSettings size={24} color="white"/>}
                        Settings
                    </button>
                    <button onClick={handleLogout} className="w-[90%] h-[50%] rounded-[0.3rem] text-[var(--bg-white)] bg-[var(--primary-blue)] cursor-pointer flex items-center justify-start gap-[1rem]">
                    <IoPower size={24} color="var(--bg-white)"/>
                        Logout
                    </button>
                </div>
            </div>
            <div className="main w-[85%] h-full flex flex-col items-center justify-between">
                <div className="header w-[100%] h-[10%] flex flex-col items-center justify-center border-b border-[var(--primary-grey)]">
                    <div className="header-container w-[90%] h-[100%] flex items-center justify-between">
                        <div className="date flex gap-[1rem] items-center">
                            {/* todays date and current time */}
                            <p>{new Date().toLocaleDateString()}</p>
                            <ClockAPI />
                        </div>
                        <div className="search w-[50%] h-[50%] border border-[var(--primary-grey)] rounded-[1rem]"></div>
                        <div className="user-profile w-[15%] h-[50%] flex items-center justify-end gap-[1rem]">
                            <MdOutlineNotifications size={30} color="var(--primary-grey)"/>
                            {userProfile.profile_picture ? 
                                <img src={userProfile.profile_picture} alt="User Profile" className="w-[100%] h-[100%] object-cover rounded-[50%]" />
                                : <div className='rounded-full bg-[var(--primary-blue)] text-[var(--bg-white)] w-[2.5rem] h-[2.5rem] flex items-center justify-center text-[1rem] font-[400]'>
                                {userProfile.first_name[0]}{userProfile.last_name[0]}
                                </div>
                            }
                            <p>{userProfile.first_name}</p>
                        </div>
                    </div>
                </div>
                <div className="content w-[90%] h-[90%] flex flex-col items-center justify-between">
                    <div className="top w-[100%] h-[10%]">
                        <h4 className="twm-s-title">
                            {activeTab === 'dashboard' && 'Welcome back, ' + userProfile.first_name + '!'}
                            {activeTab === 'categories' && 'Categories'}
                            {activeTab === 'settings' && 'Settings'}
                            {activeTab === 'students' && 'Students'}
                            {activeTab === 'courses' && 'Courses'}
                            {activeTab === 'instructors' && 'Instructors'}
                        </h4>
                    </div>
                    <div className="bottom w-[100%] h-[90%]">
                        {activeTab === 'dashboard' && <Dashboard />}
                        {activeTab === 'instructors' && <Instructors />}
                        {activeTab === 'students' && <Students />}
                        {activeTab === 'courses' && <Courses />}
                        {activeTab === 'categories' && <Categories />}
                        {activeTab === 'settings' && <Settings />}
                    </div>
                </div>
            </div>
        </div>
    );
}

