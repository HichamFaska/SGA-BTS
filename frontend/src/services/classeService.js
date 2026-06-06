import api from "@/lib/axios"

export const classeService = {
    async list(page = 1, params = {}) {
        const response = await api.get("/classes", { params: { page, ...params } })
        return response.data
    },

    async listAll() {
        const response = await api.get("/classes/list")
        return response.data
    },

    async show(id) {
        const response = await api.get(`/classes/${id}`)
        return response.data
    },

    async create(payload) {
        const response = await api.post("/classes", payload)
        return response.data
    },

    async update(id, payload) {
        const response = await api.put(`/classes/${id}`, payload)
        return response.data
    },

    async remove(id) {
        const response = await api.delete(`/classes/${id}`)
        return response.data
    },
}

export default classeService
