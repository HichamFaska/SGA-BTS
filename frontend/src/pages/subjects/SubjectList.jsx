import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { BookOpen, Loader2, Plus, Search, Trash2, Pencil, X } from "lucide-react"

import Can from "@/components/Can"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import subjectService from "@/services/subjectService"
import { subjectSchema } from "@/schemas/subjectSchema"
import { handleApiErrors } from "@/lib/api-errors"
import { useDebounce } from "@/hooks/useDebounce"

const defaultValues = { name: "" }

export default function SubjectList() {
    const { success: toastSuccess, error: toastError } = useToast()

    const [subjects, setSubjects] = useState([])
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const debouncedSearch = useDebounce(search)

    const form = useForm({
        resolver: zodResolver(subjectSchema),
        defaultValues,
    })

    const fetchSubjects = async (p = page, params = {}) => {
        try {
            setLoading(true)
            if (params.search === ""){
                delete params.search
            }
            const response = await subjectService.list(p, params)
            setSubjects(response.data.subjects)
            setMeta(response.data.meta)
        } catch (err) {
            toastError(err?.message ?? "Impossible de charger les matières.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubjects(page)
    }, [page])

    useEffect(() => {
        setPage(1)
        fetchSubjects(1, { search: debouncedSearch })
    }, [debouncedSearch])

    const openCreate = () => {
        setEditTarget(null)
        form.reset(defaultValues)
        setFormOpen(true)
    }

    const openEdit = (subject) => {
        setEditTarget(subject)
        form.reset({ name: subject.name })
        setFormOpen(true)
    }

    const closeForm = () => {
        setFormOpen(false)
        setEditTarget(null)
        form.reset(defaultValues)
    }

    const onSubmit = async (values) => {
        try {
            if (editTarget) {
                const response = await subjectService.update(editTarget.id, values)
                toastSuccess(response.message)
            } else {
                const response = await subjectService.create(values)
                toastSuccess(response.message)
            }
            closeForm()
            fetchSubjects(page)
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
            const response = await subjectService.remove(deleteTarget.id)
            toastSuccess(response.message)
            setDeleteTarget(null)
            fetchSubjects(page)
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
                    <BookOpen className="size-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Matières</h1>
                        <p className="text-sm text-muted-foreground">
                            {meta.total} matière{meta.total !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <Can permission="subjects.create">
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 size-4" />
                        Ajouter une matière
                    </Button>
                </Can>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                    placeholder="Rechercher une matière..."
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

            {/* Table */}
            <div className="rounded-xl border overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={2} className="py-12 text-center">
                                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : subjects.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={2} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <BookOpen className="size-10 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Aucune matière pour l&apos;instant.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            subjects.map((subject) => (
                                <TableRow key={subject.id}>
                                    <TableCell className="font-medium">{subject.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                        <Can permission="subjects.update">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8"
                                                onClick={() => openEdit(subject)}
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                        </Can>
                                        <Can permission="subjects.delete">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="size-8 text-destructive hover:text-destructive"
                                                onClick={() => setDeleteTarget(subject)}
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

            {/* Create / Edit */}
            <Dialog open={formOpen} onOpenChange={(v) => !v && closeForm()}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editTarget ? "Modifier la matière" : "Ajouter une matière"}
                        </DialogTitle>
                        <DialogDescription>
                            {editTarget
                                ? "Modifiez le nom de la matière."
                                : "Entrez le nom de la nouvelle matière."}
                        </DialogDescription>
                    </DialogHeader>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Mathématiques" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={closeForm}>
                                    Annuler
                                </Button>
                                <Button type="submit" disabled={form.formState.isSubmitting}>
                                    {form.formState.isSubmitting && (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                    )}
                                    {editTarget ? "Enregistrer" : "Ajouter"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </FormProvider>
                </DialogContent>
            </Dialog>

            {/* Delete */}
            <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer la matière</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer{" "}
                            <span className="font-medium text-foreground">
                                {deleteTarget?.name}
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
