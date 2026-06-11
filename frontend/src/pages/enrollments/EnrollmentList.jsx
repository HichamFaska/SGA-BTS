import { useEffect, useState } from "react"
import { flushSync } from "react-dom"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { ClipboardList, Eye, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, UserPlus, Users, X } from "lucide-react"

import Can from "@/components/Can"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

import {
    FormProvider,
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from "@/components/ui/form"

import { useToast } from "@/components/ui/use-toast"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"

import enrollmentService from "@/services/enrollmentService"
import classeService from "@/services/classeService"
import academicYearService from "@/services/academicYearService"
import studentService from "@/services/studentService"
import { enrollmentSchema } from "@/schemas/enrollmentSchema"
import { studentSchema } from "@/schemas/studentSchema"
import { handleApiErrors } from "@/lib/api-errors"
import { useDebounce } from "@/hooks/useDebounce"

const STATUS_LABELS = {
    active: { label: "Actif", variant: "default" },
    completed: { label: "Terminé", variant: "secondary" },
    redoubling: { label: "Redoublant",  variant: "outline" },
    abandoned: { label: "Abandonné", variant: "destructive" },
}

const STATUSES = Object.entries(STATUS_LABELS).map(([value, { label }]) => ({ value, label }))

const defaultValues = {
    student_id: "",
    class_id: "",
    academic_year_id: "",
    enrollment_date: new Date().toISOString().split("T")[0],
    status: "active",
}

export default function EnrollmentList() {
    const navigate = useNavigate()
    const { success: toastSuccess, error: toastError } = useToast()

    const [enrollments, setEnrollments] = useState([])
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [classeId, setClasseId] = useState("")
    const [academicYearId, setAcademicYearId] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [classes, setClasses] = useState([])
    const [academicYears, setAcademicYears] = useState([])
    const [students, setStudents] = useState([])

    const [createFormOpen, setCreateFormOpen] = useState(false)
    const [editFormOpen, setEditFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [showTarget, setShowTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)
    const [studentFormOpen, setStudentFormOpen] = useState(false)

    const debouncedSearch = useDebounce(search)

    const form = useForm({
        resolver: zodResolver(enrollmentSchema),
        defaultValues,
    })

    const studentDefaultValues = { first_name: "",
        last_name: "",
        matricule: "",
        email: "", birth_date: "",
        phone: "",
        address: ""
    }

    const studentForm = useForm({
        resolver: zodResolver(studentSchema),
        defaultValues: studentDefaultValues,
    })

    const fetchEnrollments = async (p = page) => {
        try {
            setLoading(true)
            const params = {
                search: debouncedSearch,
                class_id: classeId,
                academic_year_id: academicYearId,
                status: statusFilter,
            }
            const response = await enrollmentService.list(p, params)
            setEnrollments(response.data.enrollments)
            setMeta(response.data.meta)
        } catch (err) {
            toastError(err?.message ?? "Impossible de charger les inscriptions.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        Promise.all([
            classeService.listAll(),
            academicYearService.listAll(),
            studentService.list(1, { per_page: 500 }),
        ]).then(([classeRes, yearRes, studentRes]) => {
            setClasses(classeRes.data.classes ?? [])
            const years = yearRes.data.academic_years ?? []
            setAcademicYears(years)
            setStudents(studentRes.data.students ?? [])
            const current = years.find((year) => year.is_current)
            if (current) {
                setAcademicYearId(String(current.id))
            }
        }).catch(() => {})
    }, [])

    useEffect(() => {
        setPage(1)
        fetchEnrollments(1)
    }, [debouncedSearch, classeId, academicYearId, statusFilter])

    useEffect(() => {
        fetchEnrollments(page)
    }, [page])

    const openCreate = () => {
        const current = academicYears.find((year) => year.is_current)
        form.reset({
            ...defaultValues,
            academic_year_id: current ? String(current.id) : "",
        })
        setCreateFormOpen(true)
    }

    const closeCreate = () => {
        setCreateFormOpen(false)
        form.reset(defaultValues)
    }

    const openEdit = (enrollment) => {
        setEditTarget(enrollment)
        form.reset({
            student_id: String(enrollment.student?.id ?? ""),
            class_id: String(enrollment.classe?.id ?? ""),
            academic_year_id: String(enrollment.academic_year?.id ?? ""),
            enrollment_date: enrollment.enrollment_date,
            status: enrollment.status,
        })
        setEditFormOpen(true)
    }

    const closeEdit = () => {
        setEditFormOpen(false)
        setEditTarget(null)
        form.reset(defaultValues)
    }

    const onSubmitStudent = async (values) => {
        try {
            const response = await studentService.create(values)
            const newStudent = response.data.student
            flushSync(() => {
                setStudents((prev) => [...prev, newStudent])
            })
            form.setValue("student_id", String(newStudent.id), { shouldValidate: true, shouldDirty: true })
            toastSuccess(response.message)
            setStudentFormOpen(false)
            studentForm.reset(studentDefaultValues)
        } catch (err) {
            if (!handleApiErrors(err, studentForm.setError)) {
                toastError(err.message)
            }
        }
    }

    const onSubmitCreate = async (values) => {
        try {
            const response = await enrollmentService.create(values)
            toastSuccess(response.message)
            closeCreate()
            fetchEnrollments(page)
        } catch (err) {
            if (!handleApiErrors(err, form.setError)) {
                toastError(err.message)
            }
        }
    }

    const onSubmitEdit = async (values) => {
        try {
            const response = await enrollmentService.update(editTarget.id, values)
            toastSuccess(response.message)
            closeEdit()
            fetchEnrollments(page)
        } catch (err) {
            if (!handleApiErrors(err, form.setError)) {
                toastError(err.message)
            }
        }
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const response = await enrollmentService.remove(deleteTarget.id)
            toastSuccess(response.message)
            setDeleteTarget(null)
            fetchEnrollments(page)
        } catch (err) {
            toastError(err.message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ClipboardList className="size-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Inscriptions</h1>
                        <p className="text-sm text-muted-foreground">
                            {meta.total} inscription{meta.total !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <Can permission="enrollments.create">
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate("/enrollments/bulk")}>
                            <Users className="mr-2 size-4" />
                            Inscription en masse
                        </Button>
                        <Button onClick={openCreate}>
                            <Plus className="mr-2 size-4" />
                            Inscrire un étudiant
                        </Button>
                    </div>
                </Can>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-56 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Nom, prénom ou matricule..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 pr-8"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X className="size-4" />
                        </button>
                    )}
                </div>

                <Select value={academicYearId || "all"} onValueChange={(value) => setAcademicYearId(value === "all" ? "" : value)}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="Année académique" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les années</SelectItem>
                        {academicYears.map((year) => (
                            <SelectItem key={year.id} value={String(year.id)}>
                                {year.name}{year.is_current && <span className="ml-1.5 text-xs text-emerald-600 font-medium">en cours</span>}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={classeId || "all"} onValueChange={(value) => setClasseId(value === "all" ? "" : value)}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="Classe" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les classes</SelectItem>
                        {classes.map((classe) => (
                            <SelectItem key={classe.id} value={String(classe.id)}>{classe.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                    <SelectTrigger className="w-36">
                        <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tous les statuts</SelectItem>
                        {STATUSES.map((status) => (
                            <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => fetchEnrollments(page)}>
                    <RefreshCw className="mr-2 size-4" />
                    Actualiser
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Étudiant</TableHead>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Classe</TableHead>
                            <TableHead>Année académique</TableHead>
                            <TableHead>Date d&apos;inscription</TableHead>
                            <TableHead>Statut</TableHead>
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
                        ) : enrollments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <ClipboardList className="size-10 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Aucune inscription pour l&apos;instant.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            enrollments.map((enrollment) => (
                                <TableRow key={enrollment.id}>
                                    <TableCell className="font-medium">
                                        {enrollment.student.first_name} {enrollment.student.last_name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-sm">
                                        {enrollment.student.matricule}
                                    </TableCell>
                                    <TableCell>{enrollment.classe.name}</TableCell>
                                    <TableCell>{enrollment.academic_year.name}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {new Date(enrollment.enrollment_date).toLocaleDateString("fr-FR")}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={STATUS_LABELS[enrollment.status].variant ?? "outline"}>
                                            {STATUS_LABELS[enrollment.status].label ?? enrollment.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="size-8" onClick={() => setShowTarget(enrollment)}>
                                                <Eye className="size-4" />
                                            </Button>
                                            <Can permission="enrollments.update">
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(enrollment)}>
                                                    <Pencil className="size-4" />
                                                </Button>
                                            </Can>
                                            <Can permission="enrollments.delete">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteTarget(enrollment)}
                                                >
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

            {/* Pagination */}
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

            {/* Show */}
            <Dialog open={!!showTarget} onOpenChange={(value) => !value && setShowTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    {showTarget && (<>
                    <DialogHeader>
                        <DialogTitle>
                            {showTarget.student?.first_name} {showTarget.student?.last_name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="divide-y text-sm">

                        <p className="pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Étudiant</p>
                        {[
                            ["Matricule", showTarget.student.matricule],
                            ["Email", showTarget.student.email || "—"],
                            ["Téléphone", showTarget.student.phone || "—"],
                            ["Date de naissance", showTarget.student.birth_date
                                ? new Date(showTarget.student.birth_date).toLocaleDateString("fr-FR")
                                : "—"],
                        ].map(([label, value]) => (
                            <div key={label} className="grid grid-cols-2 gap-2 py-2">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">{value}</span>
                            </div>
                        ))}

                        <p className="py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Inscription</p>
                        {[
                            ["Classe", showTarget.classe.name],
                            ["Année académique", showTarget.academic_year.name],
                            ["Date d'inscription", new Date(showTarget.enrollment_date).toLocaleDateString("fr-FR")],
                        ].map(([label, value]) => (
                            <div key={label} className="grid grid-cols-2 gap-2 py-2">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-medium">{value}</span>
                            </div>
                        ))}
                        <div className="grid grid-cols-2 gap-2 py-2">
                            <span className="text-muted-foreground">Statut</span>
                            <Badge variant={STATUS_LABELS[showTarget.status].variant ?? "outline"} className="w-fit">
                                {STATUS_LABELS[showTarget.status].label ?? showTarget.status}
                            </Badge>
                        </div>

                    </div>
                    </>)}
                </DialogContent>
            </Dialog>

            {/* Create */}
            <Dialog open={createFormOpen} onOpenChange={(value) => !value && closeCreate()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Inscrire un étudiant</DialogTitle>
                        <DialogDescription>Remplissez les informations de la nouvelle inscription.</DialogDescription>
                    </DialogHeader>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-5">

                            <FormField control={form.control} name="student_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Étudiant</FormLabel>
                                    <div className="flex gap-2">
                                        <Select value={String(field.value)} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Sélectionner un étudiant..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-60">
                                                {students.map((student) => (
                                                    <SelectItem key={student.id} value={String(student.id)}>
                                                        <span className="font-medium">{student.first_name} {student.last_name}</span>
                                                        <span className="ml-2 text-xs text-muted-foreground font-mono">{student.matricule}</span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            className="shrink-0"
                                            onClick={() => setStudentFormOpen(true)}
                                            title="Créer un nouvel étudiant"
                                        >
                                            <UserPlus className="size-4" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="class_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Classe</FormLabel>
                                        <Select value={String(field.value)} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {classes.map((classe) => (
                                                    <SelectItem key={classe.id} value={String(classe.id)}>{classe.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="academic_year_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Année académique</FormLabel>
                                        <Select value={String(field.value)} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {academicYears.map((year) => (
                                                    <SelectItem key={year.id} value={String(year.id)}>
                                                {year.name}{year.is_current && <span className="ml-1.5 text-xs text-emerald-600 font-medium">en cours</span>}
                                            </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="enrollment_date" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date d&apos;inscription</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Statut</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {STATUSES.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeCreate}>Annuler</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                    Inscrire
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>

            {/* Edit */}
            <Dialog open={editFormOpen} onOpenChange={(value) => !value && closeEdit()}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Modifier l&apos;inscription</DialogTitle>
                        <DialogDescription>Modifiez les informations de l&apos;inscription.</DialogDescription>
                    </DialogHeader>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-5">

                            {editTarget && (
                                <div className="rounded-md border px-3 py-2 text-sm">
                                    <p className="text-xs text-muted-foreground mb-0.5">Étudiant</p>
                                    <p className="font-medium">
                                        {editTarget.student.first_name} {editTarget.student.last_name}
                                        <span className="ml-2 text-xs text-muted-foreground font-mono">{editTarget.student.matricule}</span>
                                    </p>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="class_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Classe</FormLabel>
                                        <Select value={String(field.value)} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {classes.map((classe) => (
                                                    <SelectItem key={classe.id} value={String(classe.id)}>{classe.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="academic_year_id" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Année académique</FormLabel>
                                        <Select value={String(field.value)} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {academicYears.map((year) => (
                                                    <SelectItem key={year.id} value={String(year.id)}>
                                                {year.name}{year.is_current && <span className="ml-1.5 text-xs text-emerald-600 font-medium">en cours</span>}
                                            </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="enrollment_date" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date d&apos;inscription</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />

                                <FormField control={form.control} name="status" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Statut</FormLabel>
                                        <Select value={field.value} onValueChange={field.onChange}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Choisir..." />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {STATUSES.map((status) => (
                                                    <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeEdit}>Annuler</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                    Enregistrer
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>

            {/* Création rapide d'étudiant */}
            <Dialog open={studentFormOpen} onOpenChange={(value) => { if (!value) { setStudentFormOpen(false); studentForm.reset(studentDefaultValues) } }}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Nouvel étudiant</DialogTitle>
                        <DialogDescription>
                            Créez un étudiant et il sera automatiquement sélectionné.
                        </DialogDescription>
                    </DialogHeader>
                    <FormProvider {...studentForm}>
                        <form onSubmit={studentForm.handleSubmit(onSubmitStudent)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={studentForm.control} name="first_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Prénom</FormLabel>
                                        <FormControl><Input placeholder="Youssef" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={studentForm.control} name="last_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nom</FormLabel>
                                        <FormControl><Input placeholder="Alaoui" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={studentForm.control} name="matricule" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Matricule</FormLabel>
                                        <FormControl><Input placeholder="ETU-001" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={studentForm.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl><Input type="email" placeholder="etudiant@email.com" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={studentForm.control} name="birth_date" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date de naissance</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={studentForm.control} name="phone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Téléphone</FormLabel>
                                        <FormControl><Input placeholder="06 00 00 00 00" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={studentForm.control} name="address" render={({ field }) => (
                                    <FormItem className="col-span-2">
                                        <FormLabel>Adresse</FormLabel>
                                        <FormControl><Input placeholder="Rue, ville..." {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => { setStudentFormOpen(false); studentForm.reset(studentDefaultValues) }}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={studentForm.formState.isSubmitting}>
                                    {studentForm.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                    Créer et sélectionner
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>

            {/* Delete */}
            <Dialog open={!!deleteTarget} onOpenChange={(value) => !value && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer l&apos;inscription</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer l&apos;inscription de{" "}
                            <span className="font-medium text-foreground">
                                {deleteTarget?.student?.first_name} {deleteTarget?.student?.last_name}
                            </span>{" "}
                            ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Annuler
                        </Button>
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
