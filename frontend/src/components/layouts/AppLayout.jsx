import { LogOut, Loader2, Menu, Mail, Phone } from "lucide-react"
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

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/hooks/useAuth"
import { useToast } from "@/components/ui/use-toast"
import { Sidebar } from "./Sidebar"

export function AppLayout() {
    const { logout, user } = useAuth()
    const navigate = useNavigate()
    const { success: toastSuccess, error: toastError } = useToast()
    const [logoutOpen, setLogoutOpen] = useState(false)
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
            setLogoutOpen(false)
        }
    }

    const roleLabel = user && user.role === "admin" ? "Administrateur" : "Professeur"

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

                    {user && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
                                    <Avatar className="size-9 cursor-pointer ring-2 ring-border hover:ring-primary transition-all">
                                        <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                                        <AvatarFallback className="text-xs">{user.first_name[0]}{user.last_name[0]}</AvatarFallback>
                                    </Avatar>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 p-0">
                                <div className="flex items-center gap-3 p-4">
                                    <Avatar className="size-12 shrink-0">
                                        <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                                        <AvatarFallback>{user.first_name[0]}{user.last_name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate">{user.first_name} {user.last_name}</p>
                                        <p className="text-xs text-muted-foreground">{roleLabel}</p>
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                <div className="space-y-1 px-3 py-2 text-sm text-muted-foreground">
                                    {user.email && (
                                        <div className="flex items-center gap-2">
                                            <Mail className="size-3.5 shrink-0" />
                                            <span className="truncate">{user.email}</span>
                                        </div>
                                    )}
                                    {user.phone && (
                                        <div className="flex items-center gap-2">
                                            <Phone className="size-3.5 shrink-0" />
                                            <span>{user.phone}</span>
                                        </div>
                                    )}
                                </div>
                                <DropdownMenuSeparator />
                                <div className="p-2">
                                    <button
                                        onClick={() => setLogoutOpen(true)}
                                        className="w-full flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                                    >
                                        <LogOut className="size-4" />
                                        Déconnexion
                                    </button>
                                </div>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </header>

                <main className="flex-1 overflow-y-auto px-6 py-8">
                    <Outlet />
                </main>
            </div>

            <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirmer la déconnexion</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir vous déconnecter ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setLogoutOpen(false)}>
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
