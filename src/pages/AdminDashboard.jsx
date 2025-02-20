import { useState, useEffect } from "react";    
import { useNavigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    "https://gmmzbnaxwkihfdftybyh.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdtbXpibmF4d2tpaGZkZnR5YnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk0NDU4NTcsImV4cCI6MjA1NTAyMTg1N30.HskekXUaYsdSPUTM7M3EFzZwcMyXTxROlTUagoxpE44"
);

export default function AdminDashboard() {
    const [students, setStudents] = useState([]);
    const [instructors, setInstructors] = useState([]);
    const [courses, setCourses] = useState([]);
    const [categories, setCategories] = useState([]);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        async function checkAuth() {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) navigate("/");
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
        <div className="flex justify-between">
            <h1 className="text-3xl font-bold text-[#01589A]">Super Admin Dashboard</h1>
            <button className="bg-[#01589A] text-white px-3 py-1 rounded" onClick={handleLogout}>Logout</button>
        </div>
        <div className="grid grid-cols-2 gap-6 mt-6">
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

