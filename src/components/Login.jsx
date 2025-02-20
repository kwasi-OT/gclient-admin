import { useForm } from "react-hook-form"
import { LuEye } from "react-icons/lu";
import { LuEyeOff } from "react-icons/lu";
import { MdChevronRight } from "react-icons/md";
import { useState } from 'react';
import EmailIcon from "../assets/icons/email.svg";
import PasswordIcon from "../assets/icons/lock.svg";

const Login = () => {
    const { register, handleSubmit, formState: { errors } } = useForm()

    const onSubmit = (data) => {
        console.log(data)
    }

    const [showPassword, setShowPassword] = useState(false)
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="w-[30%] md:w-[60%] sm:w-[90%] h-[30%] flex flex-col gap-[1rem] items-center">
            <h1 className="text-[2rem] font-[700] leading-[3rem]">Super Admin</h1>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full h-[100%] flex flex-col gap-[2.5rem]">
                <div className="w-full h-[3rem] flex flex-col">
                    <div className="w-[96.5%] h-fit flex items-center gap-[0.5rem] bg-[var(--input-bg)] border-b-[1px] border-[var(--primary-blue)] rounded-t-[0.3rem] p-[0.5rem]">
                        <img src={EmailIcon} alt="email icon" />
                        <input type="email" 
                            {...register("email", { required: "Email is required" })} 
                            aria-invalid={errors.email ? "true" : "false"}
                            placeholder="Email"
                            className="w-full bg-transparent border-none outline-none text-[1rem] text-[var(--text-grey)]"
                        />
                    </div>
                    {errors.email && <p className='error-message text-[0.7rem] text-[var(--primary-red)]'>{errors.email.message}</p>}
                </div>
                <div className="w-full h-[3rem] flex flex-col">
                    <div className="w-[96.5%] h-fit flex items-center gap-[0.5rem] bg-[var(--input-bg)] border-b-[1px] border-[var(--primary-blue)] rounded-t-[0.3rem] p-[0.5rem]">
                        <img src={PasswordIcon} alt="password icon" />
                        <input type={showPassword ? "text" : "password"} 
                            {...register("password", { required: "Password is required" })} 
                            aria-invalid={errors.password ? "true" : "false"}
                            placeholder="Password"
                            className="w-[100%] h-[100%] text-[1rem] text-[var(--text-grey)] bg-transparent border-none outline-none"
                        />
                        {showPassword ? <LuEyeOff color="var(--primary-blue)" size={25} onClick={togglePasswordVisibility} className="cursor-pointer"/> : <LuEye color="var(--primary-blue)" size={25} onClick={togglePasswordVisibility} className="cursor-pointer"/>}
                    </div>
                    {errors.password && <p className='error-message text-[0.7rem] text-[var(--primary-red)]'>{errors.password.message}</p>}
                </div>
                <button type="submit" className="w-full h-[3rem] rounded-[0.3rem] bg-[var(--primary-blue)] hover:bg-[var(--logo-blue)] text-[var(--bg-white)] flex items-center justify-center gap-[0.5rem]" >
                    Login
                    <MdChevronRight color="var(--bg-white)" size={25}/>    
                </button>
            </form>
        </div>
    )
}

export default Login
