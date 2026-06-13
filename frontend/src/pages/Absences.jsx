import { usePermissions } from "@/hooks/usePermissions"
import TeacherAbsencesPage from "@/pages/absences/TeacherAbsencesPage"
import AdminAbsencesPage from "@/pages/absences/AdminAbsencesPage"
import PageLoader from "@/pages/PageLoader"

export default function Absences() {
    const { hasPermission, loading } = usePermissions()

    if (loading) return <PageLoader />

    return hasPermission("sessions.create")
        ? <TeacherAbsencesPage />
        : <AdminAbsencesPage />
}
