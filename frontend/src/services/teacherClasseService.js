import api from "@/lib/axios"

export const teacherClasseService = {
    async list(page = 1, params = {}) {
        const response = await api.get("/teacher-classes", { params: { page, ...params } })
        return response.data
    },

    async create(payload) {
        const response = await api.post("/teacher-classes", payload)
        return response.data
    },

    async update(id, payload) {
        const response = await api.put(`/teacher-classes/${id}`, payload)
        return response.data
    },

    async remove(id) {
        const response = await api.delete(`/teacher-classes/${id}`)
        return response.data
    },
}

export default teacherClasseService
