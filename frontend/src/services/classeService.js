import api from "@/lib/axios"

export const classeService = {
    async list() {
        const response = await api.get("/classes")
        return response.data
    },
}

export default classeService
