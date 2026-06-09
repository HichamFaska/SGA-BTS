import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, FileUp, Loader2, Plus, RefreshCw, Search, Trash2, UserPen, Users, X } from "lucide-react"

import Can from "@/components/Can"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
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
import filiereService from "@/services/filiereService"
import academicYearService from "@/services/academicYearService"
import { studentSchema } from "@/schemas/studentSchema"
import { handleApiErrors } from "@/lib/api-errors"
import ImportDialog from "@/components/ImportDialog"
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

export default function StudentList() {
    const { success: toastSuccess, error: toastError } = useToast()

    const [students, setStudents] = useState([])
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [showTarget, setShowTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [search, setSearch] = useState("")
    const [classeId, setClasseId] = useState("")
    const [filiereId, setFiliereId] = useState("")
    const [academicYearId, setAcademicYearId] = useState("")
    const [classes, setClasses] = useState([])
    const [filieres, setFilieres] = useState([])
    const [academicYears, setAcademicYears] = useState([])
    const [importOpen, setImportOpen] = useState(false)
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [loadingForm, setLoadingForm] = useState(false)
    const debouncedSearch = useDebounce(search)

    const form = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues,
    })

    const fetchStudents = async (p = page) => {
        try {
            setLoading(true)
            const params = {
                search: debouncedSearch,
                classe_id: classeId,
                filiere_id: filiereId,
                academic_year_id: academicYearId,
            }
            const response = await studentService.list(p, params)
            setStudents(response.data.students)
            setMeta(response.data.meta)
        } catch (err) {
            toastError(err?.message ?? "Impossible de charger les étudiants.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        Promise.all([
            classeService.listAll(),
            filiereService.listAll(),
            academicYearService.listAll(),
        ]).then(([classe, filiere, academicYear]) => {
            setClasses(classe.data.classes ?? [])
            setFilieres(filiere.data.filieres ?? [])
            setAcademicYears(academicYear.data.academic_years ?? [])
        }).catch(() => {})
    }, [])

    useEffect(() => {
        setPage(1)
        fetchStudents(1)
    }, [debouncedSearch, classeId, filiereId, academicYearId])

    useEffect(() => {
        fetchStudents(page)
    }, [page])

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
                email: std.email,
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
                <Can permission="students.create">
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
                </Can>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-56 max-w-sm">
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

                <Select value={filiereId || "all"} onValueChange={(v) => setFiliereId(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Filière" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les filières</SelectItem>
                        {filieres.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={classeId || "all"} onValueChange={(v) => setClasseId(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Classe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les classes</SelectItem>
                        {classes.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={academicYearId || "all"} onValueChange={(v) => setAcademicYearId(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Année académique" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les années</SelectItem>
                        {academicYears.map((year) => (
                            <SelectItem key={year.id} value={String(year.id)}>{year.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => fetchStudents(page)}>
                    <RefreshCw className="mr-2 size-4" />
                    Actualiser
                </Button>
            </div>

            <div className="rounded-xl border overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Email</TableHead>
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
                                <TableCell colSpan={6} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <Users className="size-10 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Aucun étudiant pour l&apos;instant.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.first_name} {student.last_name}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.matricule}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.email || "—"}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.phone || "—"}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.birth_date || "—"}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => setShowTarget(student)}>
                                                <Eye className="size-4" />
                                            </Button>
                                            <Can permission="students.update">
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(student)}>
                                                    <UserPen className="size-4" />
                                                </Button>
                                            </Can>
                                            <Can permission="students.delete">
                                                <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(student)}>
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </Can>
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
                    {showTarget && (<>
                    <DialogHeader>
                        <DialogTitle>{showTarget.first_name} {showTarget.last_name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        {[
                            ["Matricule", showTarget.matricule],
                            ["Email", showTarget.email],
                            ["Téléphone", showTarget.phone],
                            ["Date de naissance", showTarget.birth_date],
                            ["Adresse", showTarget.address],
                        ].map(([label, value]) => (
                            <div key={label} className="grid grid-cols-2 gap-2 text-sm">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">{value || "—"}</span>
                            </div>
                        ))}
                    </div>
                    </>)}
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
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl><Input type="email" placeholder="etudiant@email.com" {...field} /></FormControl>
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
                            {deleteTarget && <span className="font-medium text-foreground">{deleteTarget.first_name} {deleteTarget.last_name}</span>}{" "}
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
