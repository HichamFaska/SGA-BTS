import { useAuth } from "@/hooks/useAuth"

export function useRoles() {
    const { user, loading } = useAuth()

    const role = user?.role ?? null

    const hasRole = (expectedRole) => {
        return role === expectedRole
    }

    return {
        role,
        hasRole,
        loading,
    }
}
