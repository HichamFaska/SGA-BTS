import api from "@/lib/axios"

export const studentService = {
    async list(page = 1, params = {}) {
        const response = await api.get("/students", { params: { page, ...params } })
        return response.data
    },

    async show(id) {
        const response = await api.get(`/students/${id}`)
        return response.data
    },

    async create(payload) {
        const response = await api.post("/students", payload)
        return response.data
    },

    async update(id, payload) {
        const response = await api.put(`/students/${id}`, payload)
        return response.data
    },

    async remove(id) {
        const response = await api.delete(`/students/${id}`)
        return response.data
    },
}

export default studentService
