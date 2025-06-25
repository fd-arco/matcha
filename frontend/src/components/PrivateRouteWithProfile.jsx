import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const PrivateRouteWithProfile = ({children}) => {
    const {userId, hasProfile, loading} = useUser();

    if (loading) return null;

    if (!userId) return <Navigate to="/login" />
    if (!hasProfile) return <Navigate to="/create-profil" />

    return children;
}

export default PrivateRouteWithProfile;