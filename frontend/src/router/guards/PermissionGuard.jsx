import { Navigate } from "react-router-dom";
import { usePermissions } from "@/hooks/usePermissions";
import PageLoader from "@/pages/PageLoader";

function PermissionGuard({ permission, children }) {
    const { hasPermission, loading } = usePermissions()

    if (loading) return <PageLoader />

    if (!hasPermission(permission)) return <Navigate to="/403" replace />

    return children;
}

export default PermissionGuard
