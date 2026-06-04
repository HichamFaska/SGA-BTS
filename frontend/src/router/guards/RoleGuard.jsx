import { useRoles } from "@/hooks/useRoles";
import Forbidden from "@/pages/Forbidden";
import PageLoader from "@/pages/PageLoader";

function RoleGuard({ role, children }){
    const { hasRole, loading } = useRoles();

    if (loading) {
        return <PageLoader />
    }

    if (!hasRole(role)) {
        return <Forbidden />
    }

    return children;
}

export default RoleGuard
