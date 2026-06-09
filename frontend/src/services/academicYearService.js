import api from "@/lib/axios"

export const academicYearService = {
    async listAll() {
        const response = await api.get("/academic-years/list")
        return response.data
    },
}

export default academicYearService
