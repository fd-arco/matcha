import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [userId, setUserId] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(undefined);
    const [emailVerified, setEmailVerified] = useState(false)

    useEffect(() => {
        fetch("http://localhost:3000/auth/my-me", {credentials:"include"})
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                setUserId(data?.id ?? null);
                setEmailVerified(data.verified)
                setLoading(false);
                setHasProfile(data?.hasProfile ?? false);
            })
            .catch(() => {
                setUserId(null);
                setHasProfile(false);
                setLoading(false);
            })
        
    },[]);

    useEffect(() => {
        if (!userId || emailVerified) return;

        const interval = setInterval(async () => {
        try {
            const res = await fetch(`http://localhost:3000/auth/get-user/${userId}`, {
            credentials: "include",
            });
            const data = await res.json();

            if (data.verified) {
            setEmailVerified(true);
            clearInterval(interval);
            }
        } catch (err) {
            console.error("Erreur de polling email:", err);
        }
        }, 5000);

        return () => clearInterval(interval);
    }, [userId, emailVerified]);
    
    return (
        <UserContext.Provider value = {{userId, setUserId, hasProfile, setHasProfile, loading, emailVerified}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
