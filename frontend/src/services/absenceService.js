import api from "@/lib/axios"

const absenceService = {
    async list(params = {}) {
        const response = await api.get("/absences", { params })
        return response.data
    },

    async add(sessionId, payload) {
        const response = await api.post(`/absences/sessions/${sessionId}`, payload)
        return response.data
    },

    async recordAbsences(sessionId, absences) {
        const response = await api.post(`/absences/sessions/${sessionId}/record`, { absences })
        return response.data
    },

    async update(absenceId, payload) {
        const response = await api.put(`/absences/${absenceId}`, payload)
        return response.data
    },

    async remove(absenceId) {
        const response = await api.delete(`/absences/${absenceId}`)
        return response.data
    },
}

export default absenceService
