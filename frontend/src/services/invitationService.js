import api, { csrf } from "@/lib/axios"

export const invitationService = {
    async show(token) {
        const response = await api.get(`/invitations/${token}`)
        return response.data
    },

    async accept(token, payload) {
        await csrf()
        const response = await api.post(`/invitations/${token}/accept`, payload)
        return response.data
    },
}

export default invitationService
