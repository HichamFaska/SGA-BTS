import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarDays, Loader2, Pencil, Plus, RefreshCw, Search, Trash2, X } from "lucide-react"

import Can from "@/components/Can"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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

import academicYearService from "@/services/academicYearService"
import { academicYearSchema } from "@/schemas/academicYearSchema"
import { handleApiErrors } from "@/lib/api-errors"
import { useDebounce } from "@/hooks/useDebounce"

const defaultValues = { 
    name: "",
    start_date: "",
    end_date: "",
    is_current: false
}

export default function AcademicYearList() {
    const {success: toastSuccess, error: toastError} = useToast()

    const [years, setYears] = useState([])
    const [meta, setMeta] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const debouncedSearch = useDebounce(search)

    const form = useForm({
        resolver: zodResolver(academicYearSchema),
        defaultValues,
    })

    const fetchYears = async (p = page, params = {}) => {
        try {
            setLoading(true)
            if (params.search === ""){
                delete params.search
            }
            const response = await academicYearService.list(p, params)
            setYears(response.data.academic_years)
            setMeta(response.data.meta)
        } catch (err) {
            toastError(err?.message ?? "Impossible de charger les années académiques.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchYears(page)
    }, [page])

    useEffect(() => {
        setPage(1)
        fetchYears(1, { search: debouncedSearch })
    }, [debouncedSearch])

    const openCreate = () => {
        setEditTarget(null)
        form.reset(defaultValues)
        setFormOpen(true)
    }

    const openEdit = (year) => {
        setEditTarget(year)
        form.reset({
            name: year.name,
            start_date: year.start_date,
            end_date: year.end_date,
            is_current: year.is_current,
        })
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
                const response = await academicYearService.update(editTarget.id, values)
                toastSuccess(response.message)
            } else {
                const response = await academicYearService.create(values)
                toastSuccess(response.message)
            }
            closeForm()
            fetchYears(page)
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
            const response = await academicYearService.remove(deleteTarget.id)
            toastSuccess(response.message)
            setDeleteTarget(null)
            fetchYears(page)
        } catch (err) {
            toastError(err.message)
        } finally {
            setDeleting(false)
        }
    }

    const formatDate = (dateStr) =>
        new Date(dateStr).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <CalendarDays className="size-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Années académiques</h1>
                        <p className="text-sm text-muted-foreground">
                            {meta.total} année{meta.total !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <Can permission="academic_years.create">
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 size-4" />
                        Ajouter une année
                    </Button>
                </Can>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher par nom..."
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
                <Button variant="outline" onClick={() => fetchYears(page)}>
                    <RefreshCw className="mr-2 size-4" />
                    Actualiser
                </Button>
            </div>

            {/* Cards */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : years.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                    <CalendarDays className="size-10" />
                    <p className="text-sm">Aucune année académique pour l&apos;instant.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {years.map((year) => (
                        <div
                            key={year.id}
                            className="group flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <CalendarDays className="size-4 text-primary" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-medium text-sm truncate">{year.name}</p>
                                        {year.is_current && (
                                            <Badge className="mt-0.5 text-xs" variant="default">En cours</Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                    <Can permission="academic_years.update">
                                        <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(year)}>
                                            <Pencil className="size-3.5" />
                                        </Button>
                                    </Can>
                                    <Can permission="academic_years.delete">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="size-7 text-destructive hover:text-destructive"
                                            onClick={() => setDeleteTarget(year)}
                                        >
                                            <Trash2 className="size-3.5" />
                                        </Button>
                                    </Can>
                                </div>
                            </div>
                            <div className="text-xs text-muted-foreground space-y-0.5">
                                <p>Début : {formatDate(year.start_date)}</p>
                                <p>Fin : {formatDate(year.end_date)}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

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
                            {editTarget ? "Modifier l'année académique" : "Ajouter une année académique"}
                        </DialogTitle>
                        <DialogDescription>
                            {editTarget
                                ? "Modifiez les informations de l'année académique."
                                : "Remplissez les informations de la nouvelle année académique."}
                        </DialogDescription>
                    </DialogHeader>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input placeholder="2024-2025" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={form.control} name="start_date" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date de début</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="end_date" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date de fin</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>
                            <FormField control={form.control} name="is_current" render={({ field }) => (
                                <FormItem className="flex items-center gap-3 space-y-0">
                                    <FormControl>
                                        <input
                                            type="checkbox"
                                            id="is_current"
                                            checked={field.value}
                                            onChange={field.onChange}
                                            className="size-4 rounded border-input accent-primary cursor-pointer"
                                        />
                                    </FormControl>
                                    <FormLabel htmlFor="is_current" className="cursor-pointer font-normal">
                                        Année en cours
                                    </FormLabel>
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
                        <DialogTitle>Supprimer l&apos;année académique</DialogTitle>
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
