import { Navigate, createBrowserRouter } from "react-router-dom"
import AuthGuard from "@/router/guards/AuthGuard"
import GuestGuard from "@/router/guards/GuestGuard"
import { AuthLayout } from "@/components/layouts/AuthLayout"
import { AppLayout } from "@/components/layouts/AppLayout"
import Login from "@/pages/Login"
import AcceptInvitation from "@/pages/AcceptInvitation"
import Dashboard from "@/pages/Dashboard"
import StudentList from "@/pages/students/StudentList"
import TeacherList from "@/pages/teachers/TeacherList"
import Absences from "@/pages/Absences"
import AppSettings from "@/pages/AppSettings"
import NotFound from "@/pages/NotFound"
import { RouteErrorBoundary } from "@/components/ErrorBoundary"

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
            { path: "/students", element: <StudentList /> },
            { path: "/teachers", element: <TeacherList /> },
            { path: "/absences", element: <Absences /> },
            { path: "/settings", element: <AppSettings /> },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
])

export default router
