import { LayoutDashboard, Users, GraduationCap, CalendarX, CalendarClock, CalendarDays, ClipboardList, BookUser, BookOpen, FolderOpen, School, Settings, X } from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Can from "@/components/Can"
import { useAuth } from "@/hooks/useAuth"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const APP_NAME = import.meta.env.VITE_APP_NAME

const navItems = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Étudiants", to: "/students", icon: Users, permission: "students.viewAny" },
    { label: "Professeurs", to: "/teachers", icon: GraduationCap, permission: "teachers.viewAny" },
    { label: "Matières", to: "/subjects", icon: BookOpen, permission: "subjects.viewAny" },
    { label: "Filières", to: "/filieres", icon: FolderOpen, permission: "filieres.viewAny" },
    { label: "Classes", to: "/classes", icon: School, permission: "classes.viewAny" },
    { label: "Années académiques", to: "/academic-years", icon: CalendarDays, permission: "academic_years.viewAny" },
    { label: "Inscriptions", to: "/enrollments", icon: ClipboardList, permission: "enrollments.viewAny" },
    { label: "Affectations", to: "/teacher-classes", icon: BookUser, permission: "teacher_classes.viewAny" },
    { label: "Séances", to: "/sessions", icon: CalendarClock, permission: "sessions.viewAny" },
    { label: "Absences", to: "/absences", icon: CalendarX, permission: "sessions.viewAny" },
    { label: "Paramètres", to: "/settings", icon: Settings },
]

function NavItem({ item, onClose }) {
    const location = useLocation()
    const isGroupActive = item.children?.some((c) => location.pathname.startsWith(c.to)) ?? false
    const [open, setOpen] = useState(isGroupActive)

    if (item.children) {
        const Icon = item.icon

        return (
            <div>
                <button
                    onClick={() => setOpen((v) => !v)}
                    className={cn(
                        "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                        isGroupActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                >
                    <Icon className="size-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                </button>

                {open && (
                    <div className="mt-1 ml-3 pl-3 border-l border-border space-y-0.5">
                        {item.children.map((child) => (
                            <NavLink
                                key={child.to}
                                to={child.to}
                                onClick={onClose}
                                className={({ isActive }) =>
                                    cn(
                                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )
                                }
                            >
                                <child.icon className="size-4 shrink-0" />
                                {child.label}
                            </NavLink>
                        ))}
                    </div>
                )}
            </div>
        )
    }

    const Icon = item.icon
    return (
        <NavLink
            to={item.to}
            onClick={onClose}
            className={({ isActive }) =>
                cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )
            }
        >
            <Icon className="size-4 shrink-0" />
            {item.label}
        </NavLink>
    )
}

export function Sidebar({ open, onClose }) {
    const { user } = useAuth()
    const roleLabel = user && user.role === "admin" ? "Administrateur" : "Professeur"

    return (
        <>
            {open && (
                <div
                    className="fixed inset-0 z-20 bg-black/40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    "fixed top-0 left-0 z-30 h-full w-60 bg-background border-r flex flex-col transition-transform duration-200",
                    open ? "translate-x-0" : "-translate-x-full",
                    "lg:translate-x-0 lg:static lg:z-auto"
                )}
            >
                <div className="flex h-16 items-center border-b px-5 shrink-0">
                    <p className="text-xl font-bold flex-1">{APP_NAME}</p>
                    <button
                        className="lg:hidden text-muted-foreground hover:text-foreground"
                        onClick={onClose}
                    >
                        <X className="size-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
                    {navItems.map((item) => (
                        <Can key={item.to} permission={item.permission}>
                            <NavItem item={item} onClose={onClose} />
                        </Can>
                    ))}
                </nav>

                {user && (
                    <div className="border-t px-4 py-3 shrink-0">
                        <div className="flex items-center gap-3">
                            <Avatar className="size-8 shrink-0">
                                <AvatarImage src={user.avatar} alt={`${user.first_name} ${user.last_name}`} />
                                <AvatarFallback className="text-xs">
                                    {user.first_name[0]}{user.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{user.first_name} {user.last_name}</p>
                                <p className="text-xs text-muted-foreground truncate">{roleLabel}</p>
                            </div>
                        </div>
                    </div>
                )}
            </aside>
        </>
    )
}
