import { LogOut, School } from "lucide-react"
import { Outlet, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"

const APP_NAME = import.meta.env.VITE_APP_NAME

export function AppLayout() {
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const { success: toastSuccess, error: toastError } = useToast()

    const handleLogout = async () => {
        try {
            const response = await logout()
            toastSuccess(response.message)
            navigate("/login", { replace: true })
        } catch {
            toastError("Une erreur est survenue lors de la déconnexion.")
        }
    }

    return (
        <div className="min-h-dvh bg-background">
            <header className="border-b bg-background/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className="leading-tight">
                            <p className="text-xl font-bold">{APP_NAME}</p>
                        </div>
                    </div>

                    <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
                        <LogOut className="mr-2 size-4" />
                        Déconnexion
                    </Button>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
                <Outlet />
            </main>
        </div>
    )
}
