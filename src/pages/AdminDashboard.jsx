import { useState, useEffect } from "react";    
import { useNavigate } from "react-router-dom";
import { supabase } from "../server/supabaseClient";
import Logo from "../assets/gclient-logo.png"

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
        const { data: studentsData } = await supabase.from("students").select("*");
        const { data: instructorsData } = await supabase.from("instructors").select("*");
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
        navigate("/login");
    }

    return (
        <div className="bg-white min-h-screen p-6">
            <div className="w-full h-[5%] flex flex-col justify-center items-center border-b border-[var(--primary-grey)]">
                <div className="w-[80%] h-full flex justify-between items-center">
                    <div className="w-[15%] h-[100%]">
                        <img src={Logo} alt="logo" className="w-[100%] h-[100%] object-cover" />
                    </div>
                    <div className="w-[50%] h-[100%] flex flex-col justify-center items-center">
                        <h1 className="text-2xl font-bold text-[#01589A]">Admin Dashboard</h1>
                        <p className="mt-[-0.5rem]">Welcome: {userProfile?.first_name}</p>
                    </div>
                    <button className="bg-[var(--bg-white)] border border-[var(--primary-blue)] text-[var(--primary-blue)] px-[2rem] py-[1.5rem] rounded" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
            <div className="w-[80%] m-auto mt-[4rem] grid grid-cols-2 gap-6">
                <section>
                <h2 className="text-2xl font-semibold">Students</h2>
                {students.map((student) => (
                    <div key={student.id} className="p-3 border-b flex justify-between">
                    <span>{student.name}</span>
                    <button className="bg-[#01589A] text-white px-3 py-1 rounded" onClick={() => deleteStudent(student.id)}>Delete</button>
                    </div>
                ))}
                </section>
                <section>
                <h2 className="text-2xl font-semibold">Instructors</h2>
                {instructors.map((instructor) => (
                    <div key={instructor.id} className="p-3 border-b flex justify-between">
                    <span>{instructor.name}</span>
                    <button className="bg-[#01589A] text-white px-3 py-1 rounded" onClick={() => deleteInstructor(instructor.id)}>Delete</button>
                    </div>
                ))}
                </section>
                <section>
                <h2 className="text-2xl font-semibold">Courses</h2>
                {courses.map((course) => (
                    <div key={course.id} className="p-3 border-b flex justify-between">
                    <span>{course.title}</span>
                    <button className="bg-[#01589A] text-white px-3 py-1 rounded" onClick={() => deleteCourse(course.id)}>Delete</button>
                    </div>
                ))}
                </section>
                <section>
                <h2 className="text-2xl font-semibold">Categories</h2>
                {categories.map((category) => (
                    <div key={category.id} className="p-3 border-b flex justify-between">
                    <span>{category.name}</span>
                    <button className="bg-[#01589A] text-white px-3 py-1 rounded" onClick={() => deleteCategory(category.id)}>Delete</button>
                    </div>
                ))}
                </section>
            </div>
        </div>
    );
}

