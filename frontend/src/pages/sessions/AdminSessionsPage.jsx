import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { CalendarClock, Clock, Loader2, RefreshCw, Trash2, Users } from "lucide-react"

import Can from "@/components/Can"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import sessionService from "@/services/sessionService"
import { formatTime } from "@/lib/session-utils"

export default function AdminSessionsPage() {
    const navigate = useNavigate()
    const { error: toastError, success: toastSuccess } = useToast()

    const [sessions, setSessions] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchParams, setSearchParams] = useSearchParams()
    const dateFilter = searchParams.get("date") || new Date().toISOString().split("T")[0]
    const setDateFilter = (date) => setSearchParams({ date }, { replace: true })
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const fetchSessions = async (date = dateFilter) => {
        try {
            setLoading(true)
            const response = await sessionService.list({ date })
            setSessions(response.data.sessions)
        } catch {
            toastError("Impossible de charger les séances.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSessions(dateFilter)
    }, [dateFilter])

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const response = await sessionService.remove(deleteTarget.id)
            toastSuccess(response.message)
            setDeleteTarget(null)
            fetchSessions()
        } catch (err) {
            toastError(err?.message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CalendarClock className="size-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Séances</h1>
                        <p className="text-sm text-muted-foreground">Vue administrative des séances par jour</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => fetchSessions()}>
                        <RefreshCw className="size-4" />
                    </Button>
                    <Input
                        type="date"
                        value={dateFilter}
                        onChange={(event) => setDateFilter(event.target.value)}
                        className="w-44"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <CalendarClock className="size-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Aucune séance pour cette date.</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sessions.map((session) => {
                        const appelFait = !!session.called_at
                        return (
                            <div
                                key={session.id}
                                className={`rounded-xl border p-5 space-y-3 ${appelFait ? "bg-muted/40 border-muted" : "bg-card"}`}
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="font-semibold truncate">{session.classe?.name}</p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {session.teacher ? `${session.teacher.first_name} ${session.teacher.last_name}` : "—"}
                                        </p>
                                    </div>
                                    {appelFait ? (
                                        <Badge variant="secondary" className="shrink-0">Appel fait</Badge>
                                    ) : (
                                        <Badge variant="warning" className="shrink-0">En attente</Badge>
                                    )}
                                </div>

                                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <Clock className="size-3.5 shrink-0" />
                                    {formatTime(session.start_time)} → {formatTime(session.end_time)}
                                </p>

                                {session.comment && (
                                    <p className="text-xs text-muted-foreground line-clamp-2">{session.comment}</p>
                                )}

                                <p className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">{session.absences_count ?? 0}</span>{" "}
                                    absent{(session.absences_count ?? 0) !== 1 ? "s" : ""}
                                </p>

                                <div className="flex items-center gap-2 pt-1">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={() => navigate(`/sessions/${session.id}/absences`)}
                                    >
                                        <Users className="mr-1.5 size-3.5" />
                                        Absences
                                    </Button>
                                    <Can permission="sessions.delete">
                                        {!appelFait && (
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="size-8 text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(session)}
                                            >
                                                <Trash2 className="size-3.5" />
                                            </Button>
                                        )}
                                    </Can>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer la séance</DialogTitle>
                        <DialogDescription>
                            Supprimer la séance de{" "}
                            <span className="font-medium text-foreground">{deleteTarget?.classe?.name}</span>{" "}
                            du {deleteTarget?.session_date} ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>Annuler</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                            {deleting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Supprimer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
