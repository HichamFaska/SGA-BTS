import api from "@/lib/axios"

const sessionService = {
    async list(params = {}) {
        const response = await api.get("/sessions", { params })
        return response.data
    },

    async show(sessionId) {
        const response = await api.get(`/sessions/${sessionId}`)
        return response.data
    },

    async students(sessionId) {
        const response = await api.get(`/sessions/${sessionId}/students`)
        return response.data
    },

    async availableStudents(sessionId) {
        const response = await api.get(`/sessions/${sessionId}/available-students`)
        return response.data
    },

    async myClasses() {
        const response = await api.get("/sessions/my-classes")
        return response.data
    },

    async create(payload) {
        const response = await api.post("/sessions", payload)
        return response.data
    },

    async update(sessionId, payload) {
        const response = await api.put(`/sessions/${sessionId}`, payload)
        return response.data
    },

    async remove(sessionId) {
        const response = await api.delete(`/sessions/${sessionId}`)
        return response.data
    },
}

export default sessionService
