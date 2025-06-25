import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({children}) => {
    const [userId, setUserId] = useState(undefined);
    const [loading, setLoading] = useState(true);
    const [hasProfile, setHasProfile] = useState(undefined);

    useEffect(() => {
        fetch("http://localhost:3000/auth/my-me", {credentials:"include"})
            .then(res => res.ok ? res.json() : null)
            .then(data => {
                setUserId(data?.id ?? null);
                setLoading(false);
                setHasProfile(data?.hasProfile ?? false);
            })
            .catch(() => {
                setUserId(null);
                setHasProfile(false);
                setLoading(false);
            })
        
    },[]);
    return (
        <UserContext.Provider value = {{userId, setUserId, hasProfile, setHasProfile, loading}}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);
