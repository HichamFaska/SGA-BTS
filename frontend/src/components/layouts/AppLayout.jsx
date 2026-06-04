import { LogOut, Loader2, Menu } from "lucide-react"
import { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"
import { Sidebar } from "./Sidebar"

export function AppLayout() {
    const { logout } = useAuth()
    const navigate = useNavigate()
    const { success: toastSuccess, error: toastError } = useToast()
    const [dialogOpen, setDialogOpen] = useState(false)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [loggingOut, setLoggingOut] = useState(false)

    const handleLogout = async () => {
        setLoggingOut(true)
        try {
            const response = await logout()
            toastSuccess(response.message)
            navigate("/login", { replace: true })
        } catch {
            toastError("Une erreur est survenue lors de la déconnexion.")
        } finally {
            setLoggingOut(false)
            setDialogOpen(false)
        }
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
                <header className="h-16 border-b bg-background/95 backdrop-blur flex items-center px-4 gap-4 shrink-0">
                    <button
                        className="lg:hidden text-muted-foreground hover:text-foreground"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="size-5" />
                    </button>

                    <div className="flex-1" />

                    <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
                        <LogOut className="mr-2 size-4" />
                        Déconnexion
                    </Button>
                </header>

                <main className="flex-1 overflow-y-auto px-6 py-8">
                    <Outlet />
                </main>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la déconnexion</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir vous déconnecter ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Annuler
                        </Button>
                        <Button variant="destructive" onClick={handleLogout} disabled={loggingOut}>
                            {loggingOut
                                ? <Loader2 className="mr-2 size-4 animate-spin" />
                                : <LogOut className="mr-2 size-4" />
                            }
                            Déconnexion
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
