import api from "@/lib/axios"

const statsService = {
    async index(academicYearId) {
        const response = await api.get("admin/stats", { params: { academic_year_id: academicYearId } })
        return response.data
    },
    async studentsOverThreshold(page = 1, academicYearId) {
        const response = await api.get("admin/stats/students-over-threshold", { params: { page, academic_year_id: academicYearId } })
        return response.data
    },
    async studentsConsecutiveAbsences(page = 1, academicYearId) {
        const response = await api.get("admin/stats/students-consecutive-absences", { params: { page, academic_year_id: academicYearId } })
        return response.data
    },
    async studentsAbsenceHours(page = 1, params = {}) {
        const response = await api.get("admin/stats/students-absence-hours", { params: { page, ...params } })
        return response.data
    },
    async teacherIndex() {
        const response = await api.get("teacher/stats")
        return response.data
    },
}

export default statsService
