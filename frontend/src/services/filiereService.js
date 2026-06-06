import api from "@/lib/axios"

export const filiereService = {
    async list(page = 1, params = {}) {
        const response = await api.get("/filieres", { params: { page, ...params } })
        return response.data
    },

    async show(id) {
        const response = await api.get(`/filieres/${id}`)
        return response.data
    },

    async create(payload) {
        const response = await api.post("/filieres", payload)
        return response.data
    },

    async update(id, payload) {
        const response = await api.put(`/filieres/${id}`, payload)
        return response.data
    },

    async remove(id) {
        const response = await api.delete(`/filieres/${id}`)
        return response.data
    },
}

export default filiereService
