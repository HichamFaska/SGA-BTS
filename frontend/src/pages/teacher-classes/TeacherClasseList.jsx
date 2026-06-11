import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BookUser, Check, ChevronsUpDown, Loader2, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react"

import Can from "@/components/Can"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command"
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
    FormProvider, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import {
    Pagination, PaginationContent, PaginationEllipsis,
    PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"

import teacherClasseService from "@/services/teacherClasseService"
import teacherService from "@/services/teacherService"
import classeService from "@/services/classeService"
import academicYearService from "@/services/academicYearService"
import { teacherClasseSchema } from "@/schemas/teacherClasseSchema"
import { handleApiErrors } from "@/lib/api-errors"

const defaultValues = {
    teacher_id: "",
    class_id: "",
    academic_year_id: "",
}

export default function TeacherClasseList() {
    const { success: toastSuccess, error: toastError } = useToast()

    const [assignments, setAssignments] = useState([])
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const [teacherFilter, setTeacherFilter] = useState("")
    const [classeFilter, setClasseFilter] = useState("")
    const [academicYearFilter, setAcademicYearFilter] = useState("")

    const [teachers, setTeachers] = useState([])
    const [classes, setClasses] = useState([])
    const [academicYears, setAcademicYears] = useState([])

    const [createFormOpen, setCreateFormOpen] = useState(false)
    const [teacherComboOpen, setTeacherComboOpen] = useState(false)
    const [editFormOpen, setEditFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const form = useForm({
        resolver: zodResolver(teacherClasseSchema),
        defaultValues,
    })

    const fetchAssignments = async (currentPage = page) => {
        try {
            setLoading(true)
            const response = await teacherClasseService.list(currentPage, {
                teacher_id: teacherFilter,
                class_id: classeFilter,
                academic_year_id: academicYearFilter,
            })
            setAssignments(response.data.assignments)
            setMeta(response.data.meta)
        } catch (err) {
            toastError(err?.message ?? "Impossible de charger les affectations.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        Promise.all([
            teacherService.list(1, { per_page: 500 }),
            classeService.listAll(),
            academicYearService.listAll(),
        ]).then(([teacherRes, classeRes, yearRes]) => {
            setTeachers(teacherRes.data.teachers ?? [])
            setClasses(classeRes.data.classes ?? [])
            const years = yearRes.data.academic_years ?? []
            setAcademicYears(years)
            const current = years.find((year) => year.is_current)
            if (current) setAcademicYearFilter(String(current.id))
        }).catch(() => {})
    }, [])

    useEffect(() => {
        setPage(1)
        fetchAssignments(1)
    }, [teacherFilter, classeFilter, academicYearFilter])

    useEffect(() => {
        fetchAssignments(page)
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

    const openEdit = (assignment) => {
        setEditTarget(assignment)
        form.reset({
            teacher_id: String(assignment.teacher?.id ?? ""),
            class_id: String(assignment.classe?.id ?? ""),
            academic_year_id: String(assignment.academic_year?.id ?? ""),
        })
        setEditFormOpen(true)
    }

    const closeEdit = () => {
        setEditFormOpen(false)
        setEditTarget(null)
        form.reset(defaultValues)
    }

    const onSubmitCreate = async (values) => {
        try {
            const response = await teacherClasseService.create(values)
            toastSuccess(response.message)
            closeCreate()
            fetchAssignments(page)
        } catch (err) {
            if (!handleApiErrors(err, form.setError)) {
                toastError(err.message)
            }
        }
    }

    const onSubmitEdit = async (values) => {
        try {
            const response = await teacherClasseService.update(editTarget.id, values)
            toastSuccess(response.message)
            closeEdit()
            fetchAssignments(page)
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
            const response = await teacherClasseService.remove(deleteTarget.id)
            toastSuccess(response.message)
            setDeleteTarget(null)
            fetchAssignments(page)
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
                    <BookUser className="size-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Affectations</h1>
                        <p className="text-sm text-muted-foreground">
                            {meta.total} affectation{meta.total !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <Can permission="teacher_classes.create">
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 size-4" />
                        Affecter un professeur
                    </Button>
                </Can>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <Select
                    value={academicYearFilter || "all"}
                    onValueChange={(value) => setAcademicYearFilter(value === "all" ? "" : value)}
                >
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

                <Select
                    value={classeFilter || "all"}
                    onValueChange={(value) => setClasseFilter(value === "all" ? "" : value)}
                >
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

                <Select
                    value={teacherFilter || "all"}
                    onValueChange={(value) => setTeacherFilter(value === "all" ? "" : value)}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Professeur" />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                        <SelectItem value="all">Tous les professeurs</SelectItem>
                        {teachers.map((teacher) => (
                            <SelectItem key={teacher.id} value={String(teacher.id)}>
                                {teacher.user?.first_name} {teacher.user?.last_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Button variant="outline" onClick={() => fetchAssignments(page)}>
                    <RefreshCw className="mr-2 size-4" />
                    Actualiser
                </Button>
            </div>

            {/* Table */}
            <div className="rounded-xl border overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Professeur</TableHead>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Matière</TableHead>
                            <TableHead>Classe</TableHead>
                            <TableHead>Année académique</TableHead>
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
                        ) : assignments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <BookUser className="size-10 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Aucune affectation pour l&apos;instant.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            assignments.map((assignment) => (
                                <TableRow key={assignment.id}>
                                    <TableCell className="font-medium">
                                        {assignment.teacher?.first_name} {assignment.teacher?.last_name}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground font-mono text-sm">
                                        {assignment.teacher?.matricule}
                                    </TableCell>
                                    <TableCell>
                                        {assignment.teacher?.subject
                                            ? <Badge variant="secondary">{assignment.teacher.subject}</Badge>
                                            : <span className="text-muted-foreground">—</span>
                                        }
                                    </TableCell>
                                    <TableCell>{assignment.classe?.name}</TableCell>
                                    <TableCell>
                                        <span className="flex items-center gap-1.5">
                                            {assignment.academic_year?.name}
                                            {assignment.academic_year?.is_current && (
                                                <span className="text-xs text-emerald-600 font-medium">en cours</span>
                                            )}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Can permission="teacher_classes.update">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8"
                                                    onClick={() => openEdit(assignment)}
                                                >
                                                    <Pencil className="size-4" />
                                                </Button>
                                            </Can>
                                            <Can permission="teacher_classes.delete">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-8 text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteTarget(assignment)}
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
                                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                                aria-disabled={page === 1}
                                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                        {Array.from({ length: meta.last_page }, (_, index) => index + 1).map((pageNumber) => {
                            if (pageNumber === 1 || pageNumber === meta.last_page || Math.abs(pageNumber - page) <= 1) {
                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink isActive={pageNumber === page} onClick={() => setPage(pageNumber)} className="cursor-pointer">
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            }
                            if (pageNumber === 2 && page > 3) {
                                return <PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>
                            }
                            if (pageNumber === meta.last_page - 1 && page < meta.last_page - 2) {
                                return <PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>
                            }
                            return null
                        })}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => setPage((prev) => Math.min(meta.last_page, prev + 1))}
                                aria-disabled={page === meta.last_page}
                                className={page === meta.last_page ? "pointer-events-none opacity-50" : "cursor-pointer"}
                            />
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            )}

            {/* Create */}
            <Dialog open={createFormOpen} onOpenChange={(open) => !open && closeCreate()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Affecter un professeur</DialogTitle>
                        <DialogDescription>Associez un professeur à une classe pour une année académique.</DialogDescription>
                    </DialogHeader>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4">

                            <FormField control={form.control} name="teacher_id" render={({ field }) => {
                                const selected = teachers.find((teacher) => String(teacher.id) === String(field.value))
                                return (
                                    <FormItem>
                                        <FormLabel>Professeur</FormLabel>
                                        <Popover open={teacherComboOpen} onOpenChange={setTeacherComboOpen}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        aria-expanded={teacherComboOpen}
                                                        className="w-full justify-between font-normal"
                                                    >
                                                        {selected ? (
                                                            <span className="flex items-center gap-2">
                                                                <Avatar className="size-6">
                                                                    <AvatarImage src={selected.user?.avatar} />
                                                                    <AvatarFallback className="text-xs">
                                                                        {selected.user?.first_name?.[0]}{selected.user?.last_name?.[0]}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <span>{selected.user?.first_name} {selected.user?.last_name}</span>
                                                            </span>
                                                        ) : (
                                                            "Sélectionner un professeur..."
                                                        )}
                                                        <ChevronsUpDown className="opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Rechercher..." />
                                                    <CommandList>
                                                        <CommandEmpty>Aucun professeur trouvé.</CommandEmpty>
                                                        <CommandGroup>
                                                            {teachers.map((teacher) => (
                                                                <CommandItem
                                                                    key={teacher.id}
                                                                    value={`${teacher.user?.first_name} ${teacher.user?.last_name}`}
                                                                    onSelect={() => {
                                                                        field.onChange(String(teacher.id))
                                                                        setTeacherComboOpen(false)
                                                                    }}
                                                                >
                                                                    <Avatar className="size-7 mr-2">
                                                                        <AvatarImage src={teacher.user?.avatar} />
                                                                        <AvatarFallback className="text-xs">
                                                                            {teacher.user?.first_name?.[0]}{teacher.user?.last_name?.[0]}
                                                                        </AvatarFallback>
                                                                    </Avatar>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-medium">{teacher.user?.first_name} {teacher.user?.last_name}</span>
                                                                        {teacher.subject?.name && (
                                                                            <span className="text-xs text-muted-foreground">{teacher.subject.name}</span>
                                                                        )}
                                                                    </div>
                                                                    <Check className={`ml-auto size-4 ${String(field.value) === String(teacher.id) ? "opacity-100" : "opacity-0"}`} />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }} />

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

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeCreate}>Annuler</Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                                    Affecter
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>

            {/* Edit */}
            <Dialog open={editFormOpen} onOpenChange={(open) => !open && closeEdit()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Modifier l&apos;affectation</DialogTitle>
                        <DialogDescription>Corrigez les informations de l&apos;affectation.</DialogDescription>
                    </DialogHeader>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-4">

                            {editTarget && (
                                <div className="rounded-md border px-3 py-2 text-sm">
                                    <p className="text-xs text-muted-foreground mb-1">Professeur</p>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="size-7">
                                            <AvatarImage src={editTarget.teacher?.user?.avatar} />
                                            <AvatarFallback className="text-xs">
                                                {editTarget.teacher?.first_name?.[0]}{editTarget.teacher?.last_name?.[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{editTarget.teacher?.first_name} {editTarget.teacher?.last_name}</p>
                                            {editTarget.teacher?.subject && (
                                                <p className="text-xs text-muted-foreground">{editTarget.teacher.subject}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

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

            {/* Delete */}
            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer l&apos;affectation</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer l&apos;affectation de{" "}
                            <span className="font-medium text-foreground">
                                {deleteTarget?.teacher?.first_name} {deleteTarget?.teacher?.last_name}
                            </span>{" "}
                            à la classe{" "}
                            <span className="font-medium text-foreground">{deleteTarget?.classe?.name}</span>
                            {" "}? Cette action est irréversible.
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
