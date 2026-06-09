import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, FileUp, GraduationCap, Loader2, Mail, Plus, RefreshCw, Search, Trash2, UserPen, X } from "lucide-react"

import Can from "@/components/Can"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
    FormProvider, FormField, FormItem,
    FormLabel, FormControl, FormMessage,
} from "@/components/ui/form"

import { useToast } from "@/components/ui/use-toast"
import {
    Pagination, PaginationContent, PaginationEllipsis,
    PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import teacherService from "@/services/teacherService"
import ImportDialog from "@/components/ImportDialog"
import { teacherInvitationSchema } from "@/schemas/teacherInvitationSchema"
import { handleApiErrors } from "@/lib/api-errors"
import { useDebounce } from "@/hooks/useDebounce"

const defaultValues = {
    first_name: "",
    last_name: "",
    matricule: "",
    email: "",
    birth_date: "",
    phone: "",
    address: "",
}

export default function TeacherList() {
    const { success: toastSuccess, error: toastError } = useToast()

    const [teachers, setTeachers] = useState([])
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [showTarget, setShowTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [resendTarget, setResendTarget] = useState(null)
    const [resending, setResending] = useState(null)
    const [importOpen, setImportOpen] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [loadingForm, setLoadingForm] = useState(false)
    const debouncedSearch = useDebounce(search)

    const form = useForm({
        resolver: zodResolver(teacherInvitationSchema),
        defaultValues,
    })

    const fetchTeachers = async (p = page, filters = {}) => {
        try {
            setLoading(true)
            const params = { ...filters }
            if (params.search === "") delete params.search
            if (params.status === "") delete params.status
            const response = await teacherService.list(p, params)
            setTeachers(response.data.teachers)
            setMeta(response.data.meta)
        } catch (err) {
            toastError(err?.message ?? "Impossible de charger les professeurs.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchTeachers(page)
    }, [page])

    useEffect(() => {
        setPage(1)
        fetchTeachers(1, { search: debouncedSearch, status: statusFilter })
    }, [debouncedSearch, statusFilter])

    const openCreate = () => {
        setEditTarget(null)
        form.reset(defaultValues)
        setFormOpen(true)
    }

    const openEdit = async (teacher) => {
        setEditTarget(teacher)
        setLoadingForm(true)
        setFormOpen(true)
        try {
            const response = await teacherService.show(teacher.id)
            const teach = response.data.teacher
            form.reset({
                first_name: teach.user.first_name,
                last_name: teach.user.last_name,
                matricule: teach.matricule,
                email: teach.user.email,
                birth_date: teach.birth_date,
                phone: teach.user.phone,
                address: teach.user.address,
            })
        } catch {
            toastError("Impossible de charger le professeur.")
            setFormOpen(false)
        } finally {
            setLoadingForm(false)
        }
    }

    const closeForm = () => {
        setFormOpen(false)
        setEditTarget(null)
        form.reset(defaultValues)
    }

    const onSubmit = async (values) => {
        try {
            if (editTarget) {
                const response = await teacherService.update(editTarget.id, values)
                toastSuccess(response.message)
            } else {
                const response = await teacherService.create(values)
                toastSuccess(response.message)
            }
            closeForm()
            fetchTeachers(page)
        } catch (err) {
            if (!handleApiErrors(err, form.setError)){
                toastError(err.message)
            }
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const response = await teacherService.remove(deleteTarget.id)
            toastSuccess(response.message)
            setDeleteTarget(null)
            fetchTeachers(page)
        } catch (err) {
            toastError(err.message)
        } finally {
            setDeleting(false)
        }
    }

    const handleResend = async () => {
        if (!resendTarget) return
        setResending(resendTarget.id)
        try {
            const response = await teacherService.resendInvitation(resendTarget.id)
            toastSuccess(response.message)
            setResendTarget(null)
        } catch (err) {
            toastError(err.message)
        } finally {
            setResending(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <GraduationCap className="size-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Professeurs</h1>
                        <p className="text-sm text-muted-foreground">
                            {meta.total} professeur{meta.total !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <Can role="admin">
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={() => setImportOpen(true)}>
                            <FileUp className="mr-2 size-4" />
                            Importer
                        </Button>
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 size-4" />
                            Inviter un professeur
                        </Button>
                    </div>
                </Can>
            </div>

            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom, prénom ou matricule..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-8"
                    />
                    {search && (
                        <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                            <X className="size-4" />
                        </button>
                    )}
                </div>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Tous les statuts" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => fetchTeachers(page)}>
                    <RefreshCw className="mr-2 size-4" />
                    Actualiser
                </Button>
            </div>

            <div className="rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Invitation</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-12 text-center">
                                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : teachers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <GraduationCap className="size-10 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Aucun professeur pour l&apos;instant.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            teachers.map((teacher) => {
                                return (
                                    <TableRow key={teacher.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-8">
                                                    <AvatarImage src={teacher.user.avatar} alt={`${teacher.user.first_name} ${teacher.user.last_name}`} />
                                                    <AvatarFallback className="text-xs">{teacher.user.first_name[0]}{teacher.user.last_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium">{teacher.user.first_name} {teacher.user.last_name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{teacher.matricule}</TableCell>
                                        <TableCell className="text-muted-foreground">{teacher.user.email}</TableCell>
                                        <TableCell className="text-muted-foreground">{teacher.user.phone || "—"}</TableCell>
                                        <TableCell><Badge variant={teacher.user.status === "active" ? "success" : "secondary"}>{teacher.user.status === "active" ? "Actif" : "Inactif"}</Badge></TableCell>
                                        <TableCell><Badge variant={teacher.user.email_verified_at ? "success" : "warning"}>{teacher.user.email_verified_at ? "Acceptée" : "En attente"}</Badge></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => setShowTarget(teacher)}>
                                                    <Eye className="size-4" />
                                                </Button>
                                                <Can permission="teachers.update">
                                                    <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(teacher)}>
                                                        <UserPen className="size-4" />
                                                    </Button>
                                                </Can>
                                                <Can permission="teachers.resendInvitation">
                                                    <Button variant="ghost" size="icon" className="size-8" onClick={() => setResendTarget(teacher)}>
                                                        <Mail className="size-4" />
                                                    </Button>
                                                </Can>
                                                <Can permission="teachers.delete">
                                                    <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(teacher)}>
                                                        <Trash2 className="size-4" />
                                                    </Button>
                                                </Can>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {meta.last_page > 1 && (
                <Pagination>
                    <PaginationContent>
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                aria-disabled={page === 1}
                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => {
                            if (p === 1 || p === meta.last_page || Math.abs(p - page) <= 1) {
                                return (
                                    <PaginationItem key={p}>
                                        <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">
                                            {p}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            }
                            if (p === 2 && page > 3) {
                                return <PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>
                            }
                            if (p === meta.last_page - 1 && page < meta.last_page - 2) {
                                return <PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>
                            }
                            return null
                        })}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                                aria-disabled={page === meta.last_page}
                                className={page === meta.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            <ImportDialog
                open={importOpen}
                onOpenChange={setImportOpen}
                type="teachers"
                onSuccess={() => fetchTeachers(page)}
            />

            {/* Show */}
            <Dialog open={!!showTarget} onOpenChange={(v) => !v && setShowTarget(null)}>
                <DialogContent className="sm:max-w-2xl">
                    {showTarget && (<>
                    <DialogHeader>
                        <div className="flex items-center gap-4">
                            <Avatar className="size-16">
                                <AvatarImage src={showTarget.user.avatar} alt={`${showTarget.user.first_name} ${showTarget.user.last_name}`} />
                                <AvatarFallback className="text-lg">{showTarget.user.first_name[0]}{showTarget.user.last_name[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <DialogTitle className="text-xl">{showTarget.user.first_name} {showTarget.user.last_name}</DialogTitle>
                                <p className="text-sm text-muted-foreground">{showTarget.matricule}</p>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="divide-y text-sm">
                        {[
                            ["Email", showTarget.user.email],
                            ["Téléphone", showTarget.user.phone],
                            ["Date de naissance",showTarget.birth_date],
                            ["Adresse", showTarget.user.address],
                        ].map(([label, value]) => (
                            <div key={label} className="grid grid-cols-2 gap-2 py-2">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">{value || "—"}</span>
                            </div>
                        ))}
                        <div className="grid grid-cols-2 gap-2 py-2">
                            <span className="text-muted-foreground">Invitation</span>
                            <Badge variant={showTarget.user.email_verified_at ? "success" : "warning"} className="w-fit">
                                {showTarget.user.email_verified_at ? "Acceptée" : "En attente"}
                            </Badge>
                        </div>
                    </div>
                    </>)}
                </DialogContent>
            </Dialog>

            {/* Create / Edit */}
            <Dialog open={formOpen} onOpenChange={(v) => !v && closeForm()}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? "Modifier le professeur" : "Inviter un professeur"}</DialogTitle>
                        <DialogDescription>
                            {editTarget ? "Modifiez les informations du professeur." : "Un email d'invitation sera envoyé à l'adresse saisie."}
                        </DialogDescription>
                    </DialogHeader>
                    {loadingForm ? (
                        <div className="flex h-40 items-center justify-center">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <FormProvider {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <FormField control={form.control} name="first_name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Prénom</FormLabel>
                                            <FormControl><Input placeholder="Ahmed" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="last_name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom</FormLabel>
                                            <FormControl><Input placeholder="Benali" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="matricule" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Matricule</FormLabel>
                                            <FormControl><Input placeholder="ENS-001" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    {!editTarget && (
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl><Input type="email" placeholder="prof@ecole.ma" {...field} /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    )}
                                    <FormField control={form.control} name="birth_date" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Date de naissance</FormLabel>
                                            <FormControl><Input type="date" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="phone" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Téléphone</FormLabel>
                                            <FormControl><Input placeholder="06 00 00 00 00" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="address" render={({ field }) => (
                                        <FormItem className={editTarget ? "" : "col-span-2"}>
                                            <FormLabel>Adresse</FormLabel>
                                            <FormControl><Input placeholder="Rue, ville..." {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                </div>
                                <DialogFooter>
                                    <Button type="button" variant="outline" onClick={closeForm}>Annuler</Button>
                                    <Button type="submit" disabled={form.formState.isSubmitting}>
                                        {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                        {editTarget ? "Enregistrer" : "Envoyer l'invitation"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </FormProvider>
                    )}
                </DialogContent>
            </Dialog>

            {/* Resend confirmation */}
            <Dialog open={!!resendTarget} onOpenChange={(v) => !v && setResendTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Renvoyer l&apos;invitation</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir renvoyer l&apos;invitation à{" "}
                            {resendTarget && <span className="font-medium text-foreground">{resendTarget.user.first_name} {resendTarget.user.last_name}</span>}{" "}
                            ?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setResendTarget(null)}>Annuler</Button>
                        <Button variant="success" onClick={handleResend} disabled={resending === resendTarget?.id}>
                            {resending === resendTarget?.id && <Loader2 className="mr-2 size-4 animate-spin" />}
                            <Mail className="size-4" /> Envoyer
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete */}
            <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le professeur</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer{" "}
                            {deleteTarget && <span className="font-medium text-foreground">{deleteTarget.user.first_name} {deleteTarget.user.last_name}</span>}{" "}
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
        </div>
    )
}
