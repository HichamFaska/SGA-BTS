import { RouterProvider } from "react-router-dom"
import { Toaster } from "sonner"
import { CheckCircle2, CircleAlert, Info, LoaderCircle } from "lucide-react"
import router from "@/router/router"
import { AuthProvider } from "@/contexts/AuthProvider"

function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
            <Toaster
                richColors
                position="top-right"
                icons={{
                    success: <CheckCircle2 className="size-4" />,
                    error: <CircleAlert className="size-4" />,
                    info: <Info className="size-4" />,
                    loading: <LoaderCircle className="size-4 animate-spin" />,
                }}
                toastOptions={{
                    style: {
                        borderRadius: 0,
                    },
                    className: "rounded-none",
                }}
                duration={6000}
            />
        </AuthProvider>
    )
}

export default App
