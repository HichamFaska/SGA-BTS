import { Navigate } from "react-router-dom";
import { useRoles } from "@/hooks/useRoles";
import PageLoader from "@/pages/PageLoader";

function RoleGuard({ role, children }) {
    const { hasRole, loading } = useRoles();

    if (loading) return <PageLoader />

    if (!hasRole(role)) return <Navigate to="/403" replace />

    return children;
}

export default RoleGuard
