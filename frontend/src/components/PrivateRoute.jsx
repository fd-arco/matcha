import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

const PrivateRoute = ({children}) => {
    const {userId, loading} = useUser();

    if (loading) return null;

    return userId ? children : <Navigate to="/login" />;
}

export default PrivateRoute;