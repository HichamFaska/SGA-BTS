export function handleApiErrors(error, setError) {

    if (error.status === 422 && error.errors && typeof setError === "function") {
        Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field, {
                type: "server",
                message: messages[0],
            })
        })
        return true
    }
    return false
}