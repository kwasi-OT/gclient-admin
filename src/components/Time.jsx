import { useState, useEffect } from "react";

const ClockAPI = () => {
    const [dateState, setDateState] = useState(new Date());

    useEffect(() => {
        setInterval(() => {
        setDateState(new Date());
        }, 1000);
    }, []);

    return (
        <>
        <p>
            {dateState.toLocaleString("en-US", {
            hour: "numeric",
            minute: "numeric",
            second: "2-digit",
            hour12: true,
            })}
        </p>
        </>
    );
};

export default ClockAPI;
