import api from "@/lib/axios"

export const profileService = {
    async update(payload) {
        const response = await api.put("/profile", payload)
        return response.data
    },

    async updateAvatar(file) {
        const formData = new FormData()
        formData.append("avatar", file)
        const response = await api.post("/profile/avatar", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    async deleteAvatar() {
        const response = await api.delete("/profile/avatar")
        return response.data
    },

    async updateEmail(payload) {
        const response = await api.put("/account/email", payload)
        return response.data
    },

    async verifyEmail(payload) {
        const response = await api.post("/account/email/verify", payload)
        return response.data
    },

    async updatePassword(payload) {
        const response = await api.put("/account/password", payload)
        return response.data
    },

}

export default profileService
