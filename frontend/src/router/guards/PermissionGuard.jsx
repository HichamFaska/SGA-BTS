import { usePermissions } from "@/hooks/usePermissions";
import Forbidden from "@/pages/Forbidden";
import PageLoader from "@/pages/PageLoader";

function  PermissionGuard({ permission, children }){
    const { hasPermission, loading } = usePermissions()

    if (loading) {
        return <PageLoader />
    }

    if (!hasPermission(permission)) {
        return <Forbidden />
    }

    return children;
}

export default PermissionGuard
