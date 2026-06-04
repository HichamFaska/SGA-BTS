import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
    baseURL: `${API_BASE_URL}/api`,
    headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
    },
    withCredentials: true,
    withXSRFToken: true,
})

export const csrf = () => axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
    withCredentials: true,
    withXSRFToken: true,
})

api.interceptors.response.use(
    (response) => response,
    
    (error) => {
        const status = error.response?.status
        const message = error.response?.data?.message
        const errors = error.response?.data?.errors

        return Promise.reject({
            ...error,
            status,
            message: message ?? "Une erreur est survenue.",
            errors: errors ?? {},
        })
    },
)

export default api
