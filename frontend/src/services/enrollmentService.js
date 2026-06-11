import api from "@/lib/axios"

export const enrollmentService = {
    async list(page = 1, params = {}) {
        const response = await api.get("/enrollments", { params: { page, ...params } })
        return response.data
    },

    async show(id) {
        const response = await api.get(`/enrollments/${id}`)
        return response.data
    },

    async create(payload) {
        const response = await api.post("/enrollments", payload)
        return response.data
    },

    async update(id, payload) {
        const response = await api.put(`/enrollments/${id}`, payload)
        return response.data
    },

    async remove(id) {
        const response = await api.delete(`/enrollments/${id}`)
        return response.data
    },

    async availableStudents(classId, academicYearId) {
        const response = await api.get("/enrollments/available-students", {
            params: { class_id: classId, academic_year_id: academicYearId },
        })
        return response.data
    },

    async bulkStore(payload) {
        const response = await api.post("/enrollments/bulk", payload)
        return response.data
    },
}

export default enrollmentService
