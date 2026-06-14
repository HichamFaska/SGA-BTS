import { useEffect, useRef, useState } from "react"
import { Bell, Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import notificationService from "@/services/notificationService"

const POLL_INTERVAL = 30_000

export default function NotificationBell() {
    const navigate = useNavigate()
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const intervalRef = useRef(null)

    const fetchUnreadCount = async () => {
        try {
            const response = await notificationService.unreadCount()
            setUnreadCount(response.data.count)
        } catch {}
    }

    useEffect(() => {
        fetchUnreadCount()
        intervalRef.current = setInterval(fetchUnreadCount, POLL_INTERVAL)
        return () => clearInterval(intervalRef.current)
    }, [])

    const handleOpen = async (isOpen) => {
        setOpen(isOpen)
        if (!isOpen) return

        setLoading(true)
        try {
            const [listResponse] = await Promise.all([
                notificationService.index(),
                unreadCount > 0 ? notificationService.markAllAsRead() : Promise.resolve(),
            ])
            setNotifications(listResponse.data.notifications)
            setUnreadCount(0)
        } 
        catch {}
        finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu open={open} onOpenChange={handleOpen}>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Bell className="size-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white leading-none">
                            {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-105 p-0">
                <div className="flex items-center justify-between px-5 py-3.5 border-b">
                    <p className="font-semibold">Notifications</p>
                    {notifications.length > 0 && (
                        <span className="text-xs text-muted-foreground">Tout lu</span>
                    )}
                </div>

                <div className="max-h-120 overflow-y-auto divide-y">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Loader2 className="size-5 animate-spin text-muted-foreground" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 py-12 text-center">
                            <Bell className="size-9 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">Aucune notification</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`px-5 py-4 cursor-pointer hover:bg-muted/50 transition-colors ${!notification.is_read ? "bg-primary/5" : ""}`}
                                onClick={() => { setOpen(false); navigate("/sessions") }}
                            >
                                <p className="text-sm font-semibold leading-snug">{notification.title}</p>
                                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{notification.message}</p>
                                <p className="text-xs text-muted-foreground/60 mt-2">
                                    {new Date(notification.created_at).toLocaleString("fr-FR", {
                                        day: "2-digit", month: "2-digit", year: "numeric",
                                        hour: "2-digit", minute: "2-digit",
                                    })}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
