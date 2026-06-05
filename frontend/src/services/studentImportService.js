import api from "@/lib/axios"

const studentImportService = {
    async preview(file) {
        const form = new FormData()
        form.append("file", file)
        const response = await api.post("/import/students/preview", form, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    async import(data) {
        const response = await api.post("/import/students", { data })
        return response.data
    },
}

export default studentImportService
