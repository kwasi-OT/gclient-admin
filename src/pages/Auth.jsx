import Login from "../components/Login"

const Auth = () => {
    return (
        <div className="w-full md:w-full sm:w-full h-[100vh] flex justify-center items-center bg-[url(/auth.svg)] bg-cover bg-center bg-no-repeat">
            <div className="w-[100%] md:w-[60%] sm:w-[90%] h-[100%] flex flex-col gap-[1rem] items-center justify-center  bg-[var(--bg-white)] opacity-90">
                <Login />
            </div>
        </div>
    )
}

export default Auth
