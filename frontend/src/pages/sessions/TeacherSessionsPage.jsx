import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarClock, Clock, ClipboardList, Loader2, Pencil, Plus, RefreshCw, Trash2, Users } from "lucide-react"

import { useNavigate } from "react-router-dom"
import Can from "@/components/Can"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { FormProvider, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { handleApiErrors } from "@/lib/api-errors"
import sessionService from "@/services/sessionService"
import { createSessionSchema, updateSessionSchema } from "@/schemas/sessionSchema"
import { formatTime } from "@/lib/session-utils"

const todayDate = new Date().toISOString().split("T")[0]

const createDefaultValues = {
    class_id: "",
    session_date: todayDate,
    start_time: "",
    end_time: "",
    comment: "",
}

export default function TeacherSessionsPage() {
    const navigate = useNavigate()
    const { success: toastSuccess, error: toastError } = useToast()

    const [sessions, setSessions] = useState([])
    const [myClasses, setMyClasses] = useState([])
    const [loading, setLoading] = useState(true)
    const [createDialogOpen, setCreateDialogOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const createForm = useForm({
        resolver: zodResolver(createSessionSchema),
        defaultValues: createDefaultValues,
    })

    const editForm = useForm({
        resolver: zodResolver(updateSessionSchema),
        defaultValues: { session_date: "", start_time: "", end_time: "", comment: "" },
    })

    const fetchSessions = async () => {
        try {
            setLoading(true)
            const response = await sessionService.list()
            setSessions(response.data.sessions)
        } catch {
            toastError("Impossible de charger les séances.")
        } finally {
            setLoading(false)
        }
    }

    const fetchMyClasses = async () => {
        try {
            const response = await sessionService.myClasses()
            setMyClasses(response.data.classes)
        } catch {
            toastError("Impossible de charger vos classes.")
        }
    }

    useEffect(() => {
        fetchSessions()
        fetchMyClasses()
    }, [])

    const openCreate = () => {
        createForm.reset(createDefaultValues)
        setCreateDialogOpen(true)
    }

    const closeCreate = () => {
        setCreateDialogOpen(false)
        createForm.reset()
    }

    const onSubmitCreate = async (values) => {
        try {
            const response = await sessionService.create(values)
            toastSuccess(response.message)
            closeCreate()
            fetchSessions()
        } catch (err) {
            if (!handleApiErrors(err, createForm.setError)) toastError(err?.message)
        }
    }

    const openEdit = (session) => {
        setEditTarget(session)
        editForm.reset({
            session_date: session.session_date,
            start_time: formatTime(session.start_time),
            end_time: formatTime(session.end_time),
            comment: session.comment ?? "",
        })
    }

    const closeEdit = () => {
        setEditTarget(null)
        editForm.reset()
    }

    const onSubmitEdit = async (values) => {
        try {
            const response = await sessionService.update(editTarget.id, values)
            toastSuccess(response.message)
            closeEdit()
            fetchSessions()
        } catch (err) {
            if (!handleApiErrors(err, editForm.setError)) toastError(err?.message)
        }
    }

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
                        <h1 className="text-2xl font-bold">Mes séances du jour</h1>
                        <p className="text-sm text-muted-foreground">
                            {sessions.length} séance{sessions.length !== 1 ? "s" : ""} aujourd&apos;hui
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={fetchSessions}>
                        <RefreshCw className="size-4" />
                    </Button>
                    <Can permission="sessions.create">
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 size-4" />
                            Nouvelle séance
                        </Button>
                    </Can>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <CalendarClock className="size-12 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Aucune séance pour aujourd&apos;hui.</p>
                    <Can permission="sessions.create">
                        <Button variant="outline" onClick={openCreate}>
                            <Plus className="mr-2 size-4" />
                            Créer une séance
                        </Button>
                    </Can>
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
                                    <p className="font-semibold truncate">{session.classe?.name}</p>
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
                                    {appelFait ? (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1"
                                            onClick={() => navigate(`/sessions/${session.id}/absences`)}
                                        >
                                            <Users className="mr-1.5 size-3.5" />
                                            Voir les absences
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                size="sm"
                                                className="flex-1"
                                                onClick={() => navigate(`/absences/record/${session.id}`)}
                                            >
                                                <ClipboardList className="mr-1.5 size-3.5" />
                                                Faire l&apos;appel
                                            </Button>
                                            <Can permission="sessions.update">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => openEdit(session)}
                                                >
                                                    <Pencil className="mr-1.5 size-3.5" />
                                                    Modifier
                                                </Button>
                                            </Can>
                                            <Can permission="sessions.delete">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="size-8 text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteTarget(session)}
                                                >
                                                    <Trash2 className="size-3.5" />
                                                </Button>
                                            </Can>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Créer */}
            <Dialog open={createDialogOpen} onOpenChange={(open) => !open && closeCreate()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Nouvelle séance</DialogTitle>
                    </DialogHeader>
                    <FormProvider {...createForm}>
                        <form onSubmit={createForm.handleSubmit(onSubmitCreate)} className="space-y-4">
                            <FormField control={createForm.control} name="class_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Classe</FormLabel>
                                    <Select onValueChange={field.onChange} value={String(field.value || "")}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Sélectionner une classe" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {myClasses.map((classe) => (
                                                <SelectItem key={classe.id} value={String(classe.id)}>
                                                    {classe.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={createForm.control} name="start_time" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Heure de début</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={createForm.control} name="end_time" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Heure de fin</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={createForm.control} name="comment" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Commentaire <span className="text-muted-foreground">(optionnel)</span></FormLabel>
                                    <FormControl><Textarea rows={2} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeCreate}>Annuler</Button>
                                <Button type="submit" disabled={createForm.formState.isSubmitting}>
                                    {createForm.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                    Créer
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>

            {/* Modifier */}
            <Dialog open={!!editTarget} onOpenChange={(open) => !open && closeEdit()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Modifier la séance — {editTarget?.classe?.name}</DialogTitle>
                    </DialogHeader>
                    <FormProvider {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={editForm.control} name="start_time" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Heure de début</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={editForm.control} name="end_time" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Heure de fin</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={editForm.control} name="comment" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Commentaire <span className="text-muted-foreground">(optionnel)</span></FormLabel>
                                    <FormControl><Textarea rows={2} {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeEdit}>Annuler</Button>
                                <Button type="submit" disabled={editForm.formState.isSubmitting}>
                                    {editForm.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                    Enregistrer
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>

            {/* Détails absences */}
            {/* Supprimer */}
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
