import api from "@/lib/axios"

export const teacherService = {
    async list() {
        const response = await api.get("/teachers")
        return response.data
    },

    async show(id) {
        const response = await api.get(`/teachers/${id}`)
        return response.data
    },

    async create(payload) {
        const response = await api.post("/teachers", payload)
        return response.data
    },

    async update(id, payload) {
        const response = await api.put(`/teachers/${id}`, payload)
        return response.data
    },

    async remove(id) {
        const response = await api.delete(`/teachers/${id}`)
        return response.data
    },

    async resendInvitation(teacherId) {
        const response = await api.post(`/teachers/${teacherId}/resend-invitation`)
        return response.data
    },
}

export default teacherService
