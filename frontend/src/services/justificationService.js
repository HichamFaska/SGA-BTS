import api from "@/lib/axios"

const justificationService = {
    async create(absenceId, formData) {
        const response = await api.post(`/justifications/absences/${absenceId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    async update(justificationId, formData) {
        const response = await api.post(`/justifications/${justificationId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    async remove(justificationId) {
        const response = await api.delete(`/justifications/${justificationId}`)
        return response.data
    },
}

export default justificationService
