import { useCallback, useEffect, useMemo, useState } from "react"
import authService from "@/services/authService"
import { AuthContext } from "@/contexts/auth-context"

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    const refreshUser = useCallback(async () => {
        try {
            const data = await authService.me()
            const currentUser = data.data.user
            setUser(currentUser)
            return currentUser
        } catch {
            setUser(null)
            return null
        }
    }, [])

    useEffect(() => {
        const loadUser = async () => {
            try {
                setLoading(true)
                await refreshUser()
            } finally {
                setLoading(false)
            }
        }

        loadUser()
    }, [refreshUser])

    const login = useCallback(async (credentials) => {
        const data = await authService.login(credentials)
        setUser(data.data.user)
        return data
    }, [])

    const logout = useCallback(async () => {
        const data = await authService.logout()
        setUser(null)
        return data
    }, [])

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated: Boolean(user),
        login,
        logout,
        refreshUser,
        setUser,
    }), [user, loading, login, logout, refreshUser, setUser])

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
