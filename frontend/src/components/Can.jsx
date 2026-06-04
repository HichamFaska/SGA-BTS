import { usePermissions } from "@/hooks/usePermissions"
import { useRoles } from "@/hooks/useRoles"

export function Can({
    role,
    permission,
    fallback = null,
    children,
}) {
    const { hasRole } = useRoles()
    const { hasPermission } = usePermissions()

    if (permission && !hasPermission(permission)) {
        return fallback;
    }

    if (role && !hasRole(role)) {
        return fallback;
    }
    
    return children
}

export default Can
