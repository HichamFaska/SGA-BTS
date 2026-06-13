import { useEffect, useState } from "react"
import { CalendarX, Loader2, RefreshCw, Search, Trash2, X } from "lucide-react"

import Can from "@/components/Can"
import JustifyDialog from "@/components/JustifyDialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
    Pagination, PaginationContent, PaginationEllipsis,
    PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import { useToast } from "@/components/ui/use-toast"
import absenceService from "@/services/absenceService"

const STATUS_OPTIONS = [
    { value: "non justifiée", label: "Non justifiée" },
    { value: "justifiée", label: "Justifiée" },
]

const emptyFilters = { date_from: "", date_to: "", status: "" }

export default function AdminAbsencesPage() {
    const { success: toastSuccess, error: toastError } = useToast()

    const [absences, setAbsences] = useState([])
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [filters, setFilters] = useState(emptyFilters)

    const [justifyTarget, setJustifyTarget] = useState(null)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleting, setDeleting] = useState(false)

    const fetchAbsences = async (currentPage = page, currentFilters = filters) => {
        try {
            setLoading(true)
            const params = { page: currentPage }
            Object.entries(currentFilters).forEach(([key, value]) => {
                if (value) params[key] = value
            })
            const response = await absenceService.list(params)
            setAbsences(response.data.absences)
            setMeta(response.data.meta)
        } catch {
            toastError("Impossible de charger les absences.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAbsences(page, filters)
    }, [page])

    const applyFilters = () => {
        setPage(1)
        fetchAbsences(1, filters)
    }

    const resetFilters = () => {
        setFilters(emptyFilters)
        setPage(1)
        fetchAbsences(1, emptyFilters)
    }

    const handleDelete = async () => {
        if (!deleteTarget) return
        setDeleting(true)
        try {
            const response = await absenceService.remove(deleteTarget.id)
            toastSuccess(response.message)
            setDeleteTarget(null)
            fetchAbsences()
        } catch (err) {
            toastError(err?.message)
        } finally {
            setDeleting(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <CalendarX className="size-6 text-muted-foreground" />
                <div>
                    <h1 className="text-2xl font-bold">Absences</h1>
                    <p className="text-sm text-muted-foreground">{meta.total} absence{meta.total !== 1 ? "s" : ""}</p>
                </div>
            </div>

            <div className="flex flex-wrap items-end gap-3">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Du</span>
                    <Input
                        type="date"
                        className="w-40"
                        value={filters.date_from}
                        onChange={(e) => setFilters((prev) => ({ ...prev, date_from: e.target.value }))}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Au</span>
                    <Input
                        type="date"
                        className="w-40"
                        value={filters.date_to}
                        onChange={(e) => setFilters((prev) => ({ ...prev, date_to: e.target.value }))}
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Statut</span>
                    <Select
                        value={filters.status || "all"}
                        onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value === "all" ? "" : value }))}
                    >
                        <SelectTrigger className="w-40">
                            <SelectValue placeholder="Tous" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les statuts</SelectItem>
                            {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <Button onClick={applyFilters}>
                    <Search className="mr-2 size-4" />
                    Filtrer
                </Button>
                <Button variant="outline" onClick={resetFilters}>
                    <X className="mr-2 size-4" />
                    Réinitialiser
                </Button>
                <Button variant="outline" onClick={() => fetchAbsences()}>
                    <RefreshCw className="mr-2 size-4" />
                    Actualiser
                </Button>
            </div>

            <div className="rounded-xl border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Étudiant</TableHead>
                            <TableHead>Classe</TableHead>
                            <TableHead>Professeur</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Durée</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead className="w-20" />
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-12 text-center">
                                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : absences.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="py-16 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <CalendarX className="size-10 text-muted-foreground" />
                                        <p className="text-sm text-muted-foreground">Aucune absence trouvée.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            absences.map((absence) => (
                                <TableRow key={absence.id}>
                                    <TableCell>
                                        <p className="font-medium">{absence.student?.first_name} {absence.student?.last_name}</p>
                                        <p className="text-xs text-muted-foreground">{absence.student?.matricule}</p>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{absence.session?.classe?.name ?? "—"}</TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {absence.session?.teacher
                                            ? `${absence.session.teacher.first_name} ${absence.session.teacher.last_name}`
                                            : "—"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{absence.session?.session_date ?? "—"}</TableCell>
                                    <TableCell className="text-muted-foreground">{absence.duration}</TableCell>
                                    <TableCell>
                                        <Badge variant={absence.status === "justifiée" ? "success" : "destructive"}>
                                            {absence.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1">
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
                                            <Can permission="absences.delete">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="size-7 text-destructive hover:text-destructive"
                                                    onClick={() => setDeleteTarget(absence)}
                                                >
                                                    <Trash2 className="size-3.5" />
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
                        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((pageNumber) => {
                            if (pageNumber === 1 || pageNumber === meta.last_page || Math.abs(pageNumber - page) <= 1) {
                                return (
                                    <PaginationItem key={pageNumber}>
                                        <PaginationLink isActive={pageNumber === page} onClick={() => setPage(pageNumber)} className="cursor-pointer">
                                            {pageNumber}
                                        </PaginationLink>
                                    </PaginationItem>
                                )
                            }
                            if (pageNumber === 2 && page > 3) return <PaginationItem key="start-ellipsis"><PaginationEllipsis /></PaginationItem>
                            if (pageNumber === meta.last_page - 1 && page < meta.last_page - 2) return <PaginationItem key="end-ellipsis"><PaginationEllipsis /></PaginationItem>
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

            {justifyTarget && (
                <JustifyDialog
                    absence={justifyTarget}
                    open={!!justifyTarget}
                    onOpenChange={(isOpen) => { if (!isOpen) setJustifyTarget(null) }}
                    onSuccess={() => fetchAbsences()}
                />
            )}

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
        </div>
    )
}
