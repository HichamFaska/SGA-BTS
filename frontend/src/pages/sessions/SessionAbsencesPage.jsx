import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CalendarClock, Clock, Loader2, Pencil, Plus, Trash2, Users } from "lucide-react"

import Can from "@/components/Can"
import JustifyDialog from "@/components/JustifyDialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import sessionService from "@/services/sessionService"
import absenceService from "@/services/absenceService"
import { formatTime, formatMinutes, computeSessionDuration, getDurationSlices } from "@/lib/session-utils"

export default function SessionAbsencesPage() {
    const { sessionId } = useParams()
    const navigate = useNavigate()
    const { success: toastSuccess, error: toastError } = useToast()

    const [session, setSession] = useState(null)
    const [availableStudents, setAvailableStudents] = useState([])
    const [loading, setLoading] = useState(true)

    const [editTarget, setEditTarget] = useState(null)
    const [editDuration, setEditDuration] = useState("")
    const [editing, setEditing] = useState(false)

    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const [justifyTarget, setJustifyTarget] = useState(null)

    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [addStudentId, setAddStudentId] = useState("")
    const [addDuration, setAddDuration] = useState("")
    const [adding, setAdding] = useState(false)

    useEffect(() => {
        const initialize = async () => {
            try {
                setLoading(true)
                const [sessionResponse, studentsResponse] = await Promise.all([
                    sessionService.show(Number(sessionId)),
                    sessionService.availableStudents(Number(sessionId)),
                ])
                setSession(sessionResponse.data.session)
                setAvailableStudents(studentsResponse.data.students ?? [])
            } catch {
                toastError("Impossible de charger les détails de la séance.")
                navigate(-1)
            } finally {
                setLoading(false)
            }
        }
        initialize()
    }, [sessionId])

    const refreshData = async () => {
        const [sessionResponse, studentsResponse] = await Promise.all([
            sessionService.show(Number(sessionId)),
            sessionService.availableStudents(Number(sessionId)),
        ])
        setSession(sessionResponse.data.session)
        setAvailableStudents(studentsResponse.data.students ?? [])
    }

    const sessionDuration = session
        ? computeSessionDuration(session.start_time, session.end_time)
        : 0

    const durationSlices = getDurationSlices(sessionDuration)

    const openEdit = (absence) => {
        setEditTarget(absence)
        setEditDuration(String(sessionDuration))
    }

    const closeEdit = () => {
        setEditTarget(null)
        setEditDuration("")
    }

    const handleEdit = async () => {
        if (!editTarget) return
        setEditing(true)
        try {
            const response = await absenceService.update(editTarget.id, { duration: Number(editDuration) })
            toastSuccess(response.message)
            closeEdit()
            await refreshData()
        } catch (error) {
            toastError(error?.message ?? "Impossible de modifier l'absence.")
        } finally {
            setEditing(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const response = await absenceService.remove(deleteTarget.id)
            toastSuccess(response.message)
            setDeleteTarget(null)
            await refreshData()
        } catch (error) {
            toastError(error?.message ?? "Impossible de supprimer l'absence.")
        } finally {
            setDeleting(false)
        }
    }

    const openAdd = () => {
        setAddStudentId("")
        setAddDuration(String(sessionDuration))
        setAddDialogOpen(true)
    }

    const handleAdd = async () => {
        setAdding(true)
        try {
            const response = await absenceService.add(Number(sessionId), {
                student_id: Number(addStudentId),
                duration: Number(addDuration),
            })
            toastSuccess(response.message)
            setAddDialogOpen(false)
            await refreshData()
        } catch (error) {
            toastError(error?.message ?? "Impossible d'ajouter l'absence.")
        } finally {
            setAdding(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    const absences = session?.absences ?? []

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="size-4" />
                    </Button>
                    <div className="flex items-center gap-3">
                        <CalendarClock className="size-6 text-muted-foreground" />
                        <div>
                            <h1 className="text-2xl font-bold">{session?.classe?.name}</h1>
                            <p className="text-sm text-muted-foreground">
                                {session?.teacher
                                    ? `${session.teacher.first_name} ${session.teacher.last_name} — `
                                    : ""}
                                <span className="inline-flex items-center gap-1">
                                    <Clock className="size-3" />
                                    {formatTime(session?.start_time)} → {formatTime(session?.end_time)}
                                </span>
                                {" · "}{session?.session_date}
                            </p>
                        </div>
                    </div>
                </div>
                <Can permission="absences.create">
                    {session?.called_at && availableStudents.length > 0 && (
                        <Button onClick={openAdd}>
                            <Plus className="mr-2 size-4" />
                            Ajouter une absence
                        </Button>
                    )}
                </Can>
            </div>

            <div className="rounded-xl border">
                <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30 text-sm font-medium">
                    <Users className="size-4 text-muted-foreground" />
                    {absences.length} absent{absences.length !== 1 ? "s" : ""}
                </div>

                {!session?.called_at ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <CalendarClock className="size-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">L&apos;appel n&apos;a pas encore été fait pour cette séance.</p>
                    </div>
                ) : absences.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-16 text-center">
                        <Users className="size-10 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Aucun absent enregistré pour cette séance.</p>
                    </div>
                ) : (
                    <div className="divide-y">
                        {absences.map((absence) => (
                            <div key={absence.id} className="flex items-center justify-between px-4 py-3">
                                <div>
                                    <p className="font-medium">
                                        {absence.student?.first_name} {absence.student?.last_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{absence.student?.matricule}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-muted-foreground">{absence.duration}</span>
                                    <Badge variant={absence.status === "justifiée" ? "success" : "destructive"}>
                                        {absence.status}
                                    </Badge>
                                    <Can permission="justifications.manage">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs h-7"
                                            onClick={() => setJustifyTarget(absence)}
                                        >
                                            {absence.justification ? "Voir" : "Justifier"}
                                        </Button>
                                    </Can>
                                    <Can permission="absences.update">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8"
                                            onClick={() => openEdit(absence)}
                                        >
                                            <Pencil className="size-3.5" />
                                        </Button>
                                    </Can>
                                    <Can permission="absences.delete">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-8 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTarget(absence)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </Can>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modifier la durée */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && closeEdit()}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Modifier la durée</DialogTitle>
                        <DialogDescription>
                            {editTarget?.student?.first_name} {editTarget?.student?.last_name}
                        </DialogDescription>
                    </DialogHeader>
                    <Select value={editDuration} onValueChange={setEditDuration}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Sélectionner une durée" />
                        </SelectTrigger>
                        <SelectContent>
                            {durationSlices.map((slice) => (
                                <SelectItem key={slice} value={String(slice)}>
                                    {formatMinutes(slice)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <DialogFooter>
                        <Button variant="outline" onClick={closeEdit}>Annuler</Button>
                        <Button onClick={handleEdit} disabled={editing || !editDuration}>
                            {editing && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Enregistrer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Supprimer */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer l&apos;absence</DialogTitle>
                        <DialogDescription>
                            Supprimer l&apos;absence de{" "}
                            <span className="font-medium text-foreground">
                                {deleteTarget?.student?.first_name} {deleteTarget?.student?.last_name}
                            </span>{" "}
                            ? Cette action est irréversible.
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

            {/* Ajouter une absence */}
            <Dialog open={addDialogOpen} onOpenChange={(open) => !open && setAddDialogOpen(false)}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Ajouter une absence</DialogTitle>
                        <DialogDescription>
                            Sélectionner un étudiant non encore enregistré et la durée de son absence.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium">Étudiant</p>
                            <Select value={addStudentId} onValueChange={setAddStudentId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner un étudiant" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableStudents.map((student) => (
                                        <SelectItem key={student.id} value={String(student.id)}>
                                            {student.first_name} {student.last_name}
                                            <span className="ml-2 text-muted-foreground text-xs">{student.matricule}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium">Durée</p>
                            <Select value={addDuration} onValueChange={setAddDuration}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Sélectionner une durée" />
                                </SelectTrigger>
                                <SelectContent>
                                    {durationSlices.map((slice) => (
                                        <SelectItem key={slice} value={String(slice)}>
                                            {formatMinutes(slice)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Annuler</Button>
                        <Button onClick={handleAdd} disabled={adding || !addStudentId || !addDuration}>
                            {adding && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Ajouter
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {justifyTarget && (
                <JustifyDialog
                    absence={justifyTarget}
                    open={!!justifyTarget}
                    onOpenChange={(isOpen) => { if (!isOpen) setJustifyTarget(null) }}
                    onSuccess={() => refreshData()}
                />
            )}
        </div>
    )
}
