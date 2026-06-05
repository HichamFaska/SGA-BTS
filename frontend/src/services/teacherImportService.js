import api from "@/lib/axios"

const teacherImportService = {
    async preview(file) {
        const form = new FormData()
        form.append("file", file)
        const response = await api.post("/import/teachers/preview", form, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        return response.data
    },

    async import(data) {
        const response = await api.post("/import/teachers", { data })
        return response.data
    },
}

export default teacherImportService
