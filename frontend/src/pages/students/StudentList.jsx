import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, FileUp, Loader2, Plus, Search, Trash2, UserPen, Users, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import studentService from "@/services/studentService"
import classeService from "@/services/classeService"
import { studentSchema } from "@/schemas/studentSchema"
import { handleApiErrors } from "@/lib/api-errors"
import ImportDialog from "@/components/ImportDialog"
import { useDebounce } from "@/hooks/useDebounce"

const defaultValues = {
    first_name: "",
    last_name: "",
    matricule: "",
    class_id: "",
    birth_date: "",
    phone: "",
    address: "",
}

export default function StudentList() {
    const { success: toastSuccess, error: toastError } = useToast()

    const [students, setStudents] = useState([])
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
    const [page, setPage] = useState(1)
    const [classes, setClasses] = useState([])
    const [loading, setLoading] = useState(true)
    const [showTarget, setShowTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [search, setSearch] = useState("")
    const [classFilter, setClassFilter] = useState("")
    const [importOpen, setImportOpen] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [loadingForm, setLoadingForm] = useState(false)
    const debouncedSearch = useDebounce(search)

    const form = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues,
    })

    const fetchStudents = async (p = page, filters = {}) => {
        try {
            setLoading(true)
            const params = { ...filters }
            if (params.class_id === "") delete params.class_id
            if (params.search === "") delete params.search
            const response = await studentService.list(p, params)
            setStudents(response.data.students)
            setMeta(response.data.meta)
        } catch (err) {
            toastError(err?.message ?? "Impossible de charger les étudiants.")
        } finally {
            setLoading(false)
        }
    }

    const fetchClasses = async () => {
        try {
            const response = await classeService.list()
            setClasses(response.data.classes ?? [])
        } catch {
            toastError("Impossible de charger les classes.")
        }
    }

    useEffect(() => {
        fetchStudents(page)
    }, [page])

    useEffect(() => {
        setPage(1)
        fetchStudents(1, { search: debouncedSearch, class_id: classFilter })
    }, [debouncedSearch, classFilter])

    useEffect(() => {
        fetchClasses()
    }, [])

    const openCreate = () => {
        setEditTarget(null)
        form.reset(defaultValues)
        setFormOpen(true)
    }

    const openEdit = async (student) => {
        setEditTarget(student)
        setLoadingForm(true)
        setFormOpen(true)
        try {
            const response = await studentService.show(student.id)
            const std = response.data.student
            form.reset({
                first_name: std.first_name,
                last_name: std.last_name,
                matricule: std.matricule,
                class_id: std.class_id,
                birth_date: std.birth_date,
                phone: std.phone,
                address: std.address,
            })
        } catch {
            toastError("Impossible de charger l'étudiant.")
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
                const response = await studentService.update(editTarget.id, values)
                toastSuccess(response.message)
            } else {
                const response = await studentService.create(values)
                toastSuccess(response.message)
            }
            closeForm()
            fetchStudents(page)
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
            const response = await studentService.remove(deleteTarget.id)
            toastSuccess(response.message)
            setDeleteTarget(null)
            fetchStudents(page)
        } catch (err) {
            toastError(err.message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Users className="size-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Étudiants</h1>
                        <p className="text-sm text-muted-foreground">
                            {meta.total} étudiant{meta.total !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => setImportOpen(true)}>
                        <FileUp className="mr-2 size-4" />
                        Importer
                    </Button>
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 size-4" />
                        Ajouter un étudiant
                    </Button>
                </div>
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
                <Select value={classFilter} onValueChange={(v) => setClassFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Toutes les classes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les classes</SelectItem>
                        {classes.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="rounded-xl border overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Classe</TableHead>
                            <TableHead>Téléphone</TableHead>
                            <TableHead>Date de naissance</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center">
                                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                    Aucun étudiant pour l&apos;instant.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.first_name} {student.last_name}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.matricule}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.classe?.name || "—"}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.phone || "—"}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.birth_date || "—"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => setShowTarget(student)}>
                                                <Eye className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(student)}>
                                                <UserPen className="size-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(student)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
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
                type="students"
                onSuccess={() => fetchStudents(page)}
            />

            {/* Show */}
            <Dialog open={!!showTarget} onOpenChange={(v) => !v && setShowTarget(null)}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{showTarget?.first_name} {showTarget?.last_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {[
                            ["Matricule", showTarget?.matricule],
                            ["Classe", showTarget?.classe?.name],
                            ["Téléphone", showTarget?.phone],
                            ["Date de naissance",showTarget?.birth_date],
                            ["Adresse", showTarget?.address],
                        ].map(([label, value]) => (
                            <div key={label} className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">{value || "—"}</span>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Create / Edit */}
            <Dialog open={formOpen} onOpenChange={(v) => !v && closeForm()}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>{editTarget ? "Modifier l'étudiant" : "Ajouter un étudiant"}</DialogTitle>
                        <DialogDescription>
                            {editTarget ? "Modifiez les informations de l'étudiant." : "Remplissez les informations du nouvel étudiant."}
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
                                            <FormControl><Input placeholder="Youssef" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="last_name" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom</FormLabel>
                                            <FormControl><Input placeholder="Alaoui" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="matricule" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Matricule</FormLabel>
                                            <FormControl><Input placeholder="ETU-001" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="class_id" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Classe</FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value ? String(field.value) : ""}>
                                                <FormControl>
                                                    <SelectTrigger className="w-full">
                                                        <SelectValue placeholder="Sélectionner une classe" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {classes.map((c) => (
                                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
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
                                        <FormItem className="col-span-2">
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
                                        {editTarget ? "Enregistrer" : "Ajouter"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </FormProvider>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete */}
            <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer l&apos;étudiant</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer{" "}
                            <span className="font-medium text-foreground">{deleteTarget?.first_name} {deleteTarget?.last_name}</span>{" "}
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
