import api from "@/lib/axios"

const notificationService = {
    async index() {
        const response = await api.get("/notifications")
        return response.data
    },

    async unreadCount() {
        const response = await api.get("/notifications/unread-count")
        return response.data
    },

    async markAllAsRead() {
        const response = await api.post("/notifications/read-all")
        return response.data
    },
}

export default notificationService
