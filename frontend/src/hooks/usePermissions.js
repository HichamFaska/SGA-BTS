import { useMemo } from "react"
import { useAuth } from "@/hooks/useAuth"

export function usePermissions() {
    const { user, loading } = useAuth()

    const permissions = useMemo(() => user?.permissions ?? {}, [user])

    const permissionSet = useMemo(() => {
        if (Array.isArray(permissions)) return new Set(permissions)
        const flat = []
        for (const [resource, actions] of Object.entries(permissions)) {
            for (const [action, allowed] of Object.entries(actions)) {
                if (allowed) flat.push(`${resource}.${action}`)
            }
        }
        return new Set(flat)
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
