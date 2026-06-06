import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { GraduationCap, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

import Can from "@/components/Can"
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

import classeService from "@/services/classeService"
import filiereService from "@/services/filiereService"
import { classeSchema } from "@/schemas/classeSchema"
import { handleApiErrors } from "@/lib/api-errors"
import { useDebounce } from "@/hooks/useDebounce"

const LEVELS = [
    { value: "1ere_annee", label: "1ère année" },
    { value: "2eme_annee", label: "2ème année" },
]

const defaultValues = { name: "", level: "", filiere_id: "" }

export default function ClasseList() {
    const { success: toastSuccess, error: toastError } = useToast()

    const [classes, setClasses] = useState([])
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [filieres, setFilieres] = useState([])
    const [search, setSearch] = useState("")
    const [filiereFilter, setFiliereFilter] = useState("")
    const [formOpen, setFormOpen] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const debouncedSearch = useDebounce(search)

    const form = useForm({
        resolver: zodResolver(classeSchema),
        defaultValues,
    })

    const fetchClasses = async (p = page, params = {}) => {
        try {
            setLoading(true)

            if (params.search === ""){
                delete params.search
            }
            if (params.filiere_id === ""){
                delete params.filiere_id
            }

            const response = await classeService.list(p, params)
            setClasses(response.data.classes)
            setMeta(response.data.meta)
        } catch (err) {
            toastError(err?.message ?? "Impossible de charger les classes.")
        } finally {
            setLoading(false)
        }
    }

    const fetchFilieres = async () => {
        try {
            const response = await filiereService.list(1, {})
            setFilieres(response.data.filieres ?? [])
        } catch {
            toastError("Impossible de charger les filières.")
        }
    }

    useEffect(() => {
        fetchClasses(page)
    }, [page])

    useEffect(() => {
        setPage(1)
        fetchClasses(1, { search: debouncedSearch, filiere_id: filiereFilter })
    }, [debouncedSearch, filiereFilter])

    useEffect(() => {
        fetchFilieres()
    }, [])

    const openCreate = () => {
        setEditTarget(null)
        form.reset(defaultValues)
        setFormOpen(true)
    }

    const openEdit = (classe) => {
        setEditTarget(classe)
        form.reset({
            name: classe.name,
            level: classe.level,
            filiere_id: classe.filiere_id,
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
                const response = await classeService.update(editTarget.id, values)
                toastSuccess(response.message)
            } else {
                const response = await classeService.create(values)
                toastSuccess(response.message)
            }
            closeForm()
            fetchClasses(page)
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
            const response = await classeService.remove(deleteTarget.id)
            toastSuccess(response.message)
            setDeleteTarget(null)
            fetchClasses(page)
        } catch (err) {
            toastError(err.message)
        } finally {
            setDeleting(false)
        }
    }

    const levelLabel = (value) => LEVELS.find((l) => l.value === value)?.label ?? value

    return (
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <GraduationCap className="size-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Classes</h1>
                        <p className="text-sm text-muted-foreground">
                            {meta.total} classe{meta.total !== 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
                <Can permission="classes.create">
                    <Button onClick={openCreate}>
                        <Plus className="mr-2 size-4" />
                        Ajouter une classe
                    </Button>
                </Can>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une classe..."
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
                <Select value={filiereFilter} onValueChange={(v) => setFiliereFilter(v === "all" ? "" : v)}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Toutes les filières" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Toutes les filières</SelectItem>
                        {filieres.map((f) => (
                            <SelectItem key={f.id} value={String(f.id)}>{f.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-xl border overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nom</TableHead>
                            <TableHead>Niveau</TableHead>
                            <TableHead>Filière</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead className="w-10" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-12 text-center">
                                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : classes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <GraduationCap className="size-10 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Aucune classe pour l&apos;instant.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            classes.map((classe) => (
                                <TableRow key={classe.id}>
                                    <TableCell className="font-medium">{classe.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{levelLabel(classe.level)}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {classe.filiere?.name ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                        {classe.filiere?.code
                                            ? <Badge variant="secondary" className="font-mono">{classe.filiere.code}</Badge>
                                            : <span className="text-muted-foreground">—</span>
                                        }
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
                                            <Can permission="classes.update">
                                                <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(classe)}>
                                                    <Pencil className="size-4" />
                                                </Button>
                                            </Can>
                                            <Can permission="classes.delete">
                                                <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(classe)}>
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
                            {editTarget ? "Modifier la classe" : "Ajouter une classe"}
                        </DialogTitle>
                        <DialogDescription>
                            {editTarget
                                ? "Modifiez les informations de la classe."
                                : "Remplissez les informations de la nouvelle classe."}
                        </DialogDescription>
                    </DialogHeader>

                    <FormProvider {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField control={form.control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nom</FormLabel>
                                    <FormControl>
                                        <Input placeholder="GI-1A" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="level" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Niveau</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Sélectionner un niveau" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {LEVELS.map((l) => (
                                                <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="filiere_id" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Filière</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ? String(field.value) : ""}>
                                        <FormControl>
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Sélectionner une filière" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {filieres.map((f) => (
                                                <SelectItem key={f.id} value={String(f.id)}>
                                                    {f.name} <span className="font-mono text-xs text-muted-foreground">({f.code})</span>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
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
                        <DialogTitle>Supprimer la classe</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer{" "}
                            <span className="font-medium text-foreground">{deleteTarget?.name}</span>{" "}
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
