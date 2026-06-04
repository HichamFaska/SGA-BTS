import { useMemo } from "react"
import { useAuth } from "@/hooks/useAuth"

export function usePermissions() {
    const { user, loading } = useAuth()

    const permissions = useMemo(() => user?.permissions ?? {}, [user])

    const permissionSet = useMemo(() => {
        return new Set(Array.isArray(permissions) ? permissions : [])
    }, [permissions])

    const hasPermission = (permission) => {
        return permissionSet.has(permission)
    }

    return {
        permissions,
        hasPermission,
        loading,
    }
}
