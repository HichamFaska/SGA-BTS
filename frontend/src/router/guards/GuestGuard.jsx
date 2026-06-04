import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import PageLoader from "@/pages/PageLoader";

function GuestGuard({ children }){
    const { loading, isAuthenticated } = useAuth()

    if (loading) {
        return <PageLoader />
    }

    if(isAuthenticated){
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default GuestGuard
