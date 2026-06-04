import { Navigate, createBrowserRouter } from "react-router-dom"
import AuthGuard from "@/router/guards/AuthGuard"
import GuestGuard from "@/router/guards/GuestGuard"
import { AuthLayout } from "@/components/layouts/AuthLayout"
import { AppLayout } from "@/components/layouts/AppLayout"
import Login from "@/pages/Login"
import Dashboard from "@/pages/Dashboard"
import NotFound from "@/pages/NotFound"

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
            {
                index: true,
                element: <Login />,
            },
        ],
    },
    {
        path: "/dashboard",
        element: (
            <AuthGuard>
                <AppLayout />
            </AuthGuard>
        ),
        children: [
            {
                index: true,
                element: <Dashboard />,
            },
        ],
    },
    {
        path: "*",
        element: <NotFound />,
    },
])

export default router
