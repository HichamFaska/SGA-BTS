import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PageLoader from "@/pages/PageLoader";

function AuthGuard({ children }) {
    const { loading, isAuthenticated } = useAuth()

    if(loading){
        return <PageLoader />;
    }

    if(!isAuthenticated){
        return (
            <Navigate to="/login" replace />
        );
    }

    return children;
}

export default AuthGuard