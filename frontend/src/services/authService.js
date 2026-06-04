import api, { csrf } from "@/lib/axios"

export const authService = {
    async login(credentials) {
        await csrf()
        const response = await api.post("/login", credentials)
        return response.data
    },

    async logout() {
        await csrf()
        const response = await api.post("/logout")
        return response.data
    },

    async me() {
        const response = await api.get("/me")
        return response.data
    },
}

export default authService
