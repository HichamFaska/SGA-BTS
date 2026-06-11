import { Navigate, createBrowserRouter } from "react-router-dom"
import AuthGuard from "@/router/guards/AuthGuard"
import GuestGuard from "@/router/guards/GuestGuard"
import PermissionGuard from "@/router/guards/PermissionGuard"
import RoleGuard from "@/router/guards/RoleGuard"
import { AuthLayout } from "@/components/layouts/AuthLayout"
import { AppLayout } from "@/components/layouts/AppLayout"
import Login from "@/pages/Login"
import AcceptInvitation from "@/pages/AcceptInvitation"
import Dashboard from "@/pages/Dashboard"
import ClasseList from "@/pages/classes/ClasseList"
import FiliereList from "@/pages/filieres/FiliereList"
import StudentList from "@/pages/students/StudentList"
import SubjectList from "@/pages/subjects/SubjectList"
import TeacherList from "@/pages/teachers/TeacherList"
import AcademicYearList from "@/pages/academic-years/AcademicYearList"
import EnrollmentList from "@/pages/enrollments/EnrollmentList"
import BulkEnrollment from "@/pages/enrollments/BulkEnrollment"
import TeacherClasseList from "@/pages/teacher-classes/TeacherClasseList"
import Absences from "@/pages/Absences"
import AppSettings from "@/pages/AppSettings"
import NotFound from "@/pages/NotFound"
import { RouteErrorBoundary } from "@/components/ErrorBoundary"
import Forbidden from "@/pages/Forbidden"

const protectedLayout = (
    <AuthGuard>
        <AppLayout />
    </AuthGuard>
)

const router = createBrowserRouter([
    {
        path: "/",
        element: <Navigate to="/dashboard" replace />,
    },
    {
        path: "/login",
        element: (
            <GuestGuard>
                <AuthLayout />
            </GuestGuard>
        ),
        children: [
            { index: true, element: <Login /> },
        ],
    },
    {
        path: "/accept-invitation",
        element: <AuthLayout />,
        children: [
            { index: true, element: <AcceptInvitation /> },
        ],
    },
    {
        element: protectedLayout,
        errorElement: <RouteErrorBoundary />,
        children: [
            { path: "/dashboard", element: <Dashboard /> },
            { path: "/students", element: <PermissionGuard permission="students.viewAny"><StudentList /></PermissionGuard> },
            { path: "/teachers", element: <PermissionGuard permission="teachers.viewAny"><TeacherList /></PermissionGuard> },
            { path: "/subjects", element: <PermissionGuard permission="subjects.viewAny"><SubjectList /></PermissionGuard> },
            { path: "/filieres", element: <PermissionGuard permission="filieres.viewAny"><FiliereList /></PermissionGuard> },
            { path: "/classes", element: <PermissionGuard permission="classes.viewAny"><ClasseList /></PermissionGuard> },
            { path: "/academic-years", element: <PermissionGuard permission="academic_years.viewAny"><AcademicYearList /></PermissionGuard> },
            { path: "/enrollments", element: <PermissionGuard permission="enrollments.viewAny"><EnrollmentList /></PermissionGuard> },
            { path: "/enrollments/bulk", element: <PermissionGuard permission="enrollments.bulkCreate"><BulkEnrollment /></PermissionGuard> },
            { path: "/teacher-classes", element: <PermissionGuard permission="teacher_classes.viewAny"><TeacherClasseList /></PermissionGuard> },
            { path: "/absences", element: <Absences /> },
            { path: "/settings", element: <RoleGuard role="admin"><AppSettings /></RoleGuard> },
        ],
    },
    {
        path: "/403",
        element: <Forbidden />,
    },
    {
        path: "*",
        element: <NotFound />,
    },
])

export default router
