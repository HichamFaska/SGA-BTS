import api from "@/lib/axios"

export const academicYearService = {
    async list(page = 1, params = {}) {
        const response = await api.get("/academic-years", { params: { page, ...params } })
        return response.data
    },

    async listAll() {
        const response = await api.get("/academic-years/list")
        return response.data
    },

    async show(id) {
        const response = await api.get(`/academic-years/${id}`)
        return response.data
    },

    async create(payload) {
        const response = await api.post("/academic-years", payload)
        return response.data
    },

    async update(id, payload) {
        const response = await api.put(`/academic-years/${id}`, payload)
        return response.data
    },

    async remove(id) {
        const response = await api.delete(`/academic-years/${id}`)
        return response.data
    },
}

export default academicYearService
