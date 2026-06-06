import api from "@/lib/axios"

export const subjectService = {
    async list(page = 1, params = {}) {
        const response = await api.get("/subjects", { params: { page, ...params } })
        return response.data
    },

    async show(id) {
        const response = await api.get(`/subjects/${id}`)
        return response.data
    },

    async create(payload) {
        const response = await api.post("/subjects", payload)
        return response.data
    },

    async update(id, payload) {
        const response = await api.put(`/subjects/${id}`, payload)
        return response.data
    },

    async remove(id) {
        const response = await api.delete(`/subjects/${id}`)
        return response.data
    },
}

export default subjectService
