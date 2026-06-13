import { usePermissions } from "@/hooks/usePermissions"
import TeacherSessionsPage from "@/pages/sessions/TeacherSessionsPage"
import AdminSessionsPage from "@/pages/sessions/AdminSessionsPage"
import PageLoader from "@/pages/PageLoader"

export default function Sessions() {
    const { hasPermission, loading } = usePermissions()

    if (loading) return <PageLoader />

    return hasPermission("sessions.create")
        ? <TeacherSessionsPage />
        : <AdminSessionsPage />
}
