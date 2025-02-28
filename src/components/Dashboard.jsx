// import React from 'react'
import { HiOutlineUserGroup } from "react-icons/hi";
import { GiTeacher } from "react-icons/gi";
import { GiBookshelf } from "react-icons/gi";
import { useState } from "react";
import { useEffect } from "react";
import { supabase } from "../server/supabaseClient";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Dashboard = () => {
    const [studentsCount, setStudentsCount] = useState(0);
    const [instructorsCount, setInstructorsCount] = useState(0);
    const [coursesCount, setCoursesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        // find the total number of students
        const { count: studentsCount } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "student");
        // find the total number of instructors
        const { count: instructorsCount } = await supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "instructor");
        // find the total number of courses
        const { count: coursesCount } = await supabase.from("courses").select("*", { count: "exact", head: true });

        setStudentsCount(studentsCount);
        setInstructorsCount(instructorsCount);
        setCoursesCount(coursesCount);
        setLoading(false);
    }

    return (
        <div className="w-[100%] h-[90%]">
            <div className="top w-[100%] h-[33%] flex items-center justify-between">
                <div className="card w-[30%] h-[100%] flex flex-col justify-between items-center shadow-(--shadow-md) border border-[var(--primary-grey)] bg-[var(--student-card-bg)] rounded-[1rem]">
                    <div className="card-top flex items-center justify-between w-[100%] h-[60%] p-[1rem] box-border ">
                        <div className="left w-[30%] h-[100%] flex flex-col items-center justify-center bg-[var(--student-card-icon-bg)] rounded-[1rem]">
                            <HiOutlineUserGroup size={30} color="var(--bg-white)"/>
                        </div>
                        <div className="right w-[50%] h-[100%]">
                            <h3 className="text-[var(--bg-white)]">Total Students</h3>
                        </div>
                    </div>
                    <div className="card-bottom w-[100%] h-[40%] flex items-end justify-center">
                        {loading ? <Skeleton width={100} height={30} /> : <p className="text-[3.5rem] font-[500] text-[var(--bg-white)]">{studentsCount}</p>}
                    </div>
                </div>
                <div className="card w-[30%] h-[100%] flex flex-col justify-between items-center shadow-(--shadow-md) border border-[var(--primary-grey)] bg-[var(--instructor-card-bg)] rounded-[1rem]">
                    <div className="card-top flex items-center justify-between w-[100%] h-[60%] p-[1rem] box-border ">
                        <div className="left w-[30%] h-[100%] flex flex-col items-center justify-center bg-[var(--instructor-card-icon-bg)] rounded-[1rem]">
                            <GiTeacher size={30} color="var(--instructor-card-bg)"/>
                        </div>
                        <div className="right w-[60%] h-[100%]">
                            <h3 className="text-[var(--bg-white)]">Total Instructors</h3>
                        </div>
                    </div>
                    <div className="card-bottom w-[100%] h-[40%] flex items-end justify-center">
                        {loading ? <Skeleton width={100} height={30} /> : <p className="text-[3.5rem] font-[500] text-[var(--bg-white)]">{instructorsCount}</p>}
                    </div>
                </div>
                <div className="card w-[30%] h-[100%] shadow-(--shadow-md) border border-[var(--primary-grey)] bg-[var(--course-card-bg)] rounded-[1rem]">
                <div className="card-top flex items-center justify-between w-[100%] h-[60%] p-[1rem] box-border ">
                    <div className="left w-[30%] h-[100%] flex flex-col items-center justify-center bg-[#d2f6e7] rounded-[1rem]">
                            <GiBookshelf size={30} color="var(--course-card-bg)"/>
                        </div>
                        <div className="right w-[60%] h-[100%]">
                            <h3 className="text-[var(--bg-white)]">Total Courses</h3>
                        </div>
                    </div>
                    <div className="card-bottom w-[100%] h-[40%] flex items-end justify-center">
                        {loading ? <Skeleton width={100} height={30} /> : <p className="text-[3.5rem] font-[500] text-[var(--bg-white)]">{coursesCount}</p>}
                    </div>
                </div>
            </div>
            <div className="bottom-middle"></div>
            <div className="bottom-bottom"></div>
        </div>
    )
}

export default Dashboard
