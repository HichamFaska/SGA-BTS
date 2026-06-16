import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { ArrowLeft, Clock, Loader2, RefreshCw, Search, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import statsService from "@/services/statsService"
import classeService from "@/services/classeService"
import filiereService from "@/services/filiereService"
import academicYearService from "@/services/academicYearService"
import { useDebounce } from "@/hooks/useDebounce"

export default function StudentsAbsenceHoursPage() {
    const [students, setStudents] = useState([])
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [classeId, setClasseId] = useState("")
    const [filiereId, setFiliereId] = useState("")
    const [academicYearId, setAcademicYearId] = useState("")
    const [classes, setClasses] = useState([])
    const [filieres, setFilieres] = useState([])
    const [academicYears, setAcademicYears] = useState([])
    const debouncedSearch = useDebounce(search)

    const fetchStudents = async (p = page) => {
        try {
            setLoading(true)
            const params = {
                search: debouncedSearch,
                class_id: classeId,
                filiere_id: filiereId,
                academic_year_id: academicYearId,
            }
            const response = await statsService.studentsAbsenceHours(p, params)
            setStudents(response.data.students)
            setMeta(response.data.meta)
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

    const resetFilters = () => {
        setSearch("")
        setClasseId("")
        setFiliereId("")
        setAcademicYearId("")
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/dashboard"><ArrowLeft className="size-4" /></Link>
                </Button>
                <Clock className="size-6 text-muted-foreground" />
                <div>
                    <h1 className="text-2xl font-bold">Heures d'absence par étudiant</h1>
                    <p className="text-sm text-muted-foreground">
                        {meta.total} étudiant{meta.total !== 1 ? "s" : ""}
                    </p>
                </div>
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

                <Button variant="outline" onClick={resetFilters}>
                    <X className="mr-2 size-4" />
                    Réinitialiser
                </Button>
                <Button variant="outline" onClick={() => fetchStudents(page)}>
                    <RefreshCw className="mr-2 size-4" />
                    Actualiser
                </Button>
            </div>

            <div className="rounded-xl border overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Étudiant</TableHead>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Classe</TableHead>
                            <TableHead className="text-right">Total heures</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-12 text-center">
                                    <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : students.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="py-16 text-center text-sm text-muted-foreground">
                                    Aucun étudiant trouvé.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.matricule}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.class}</TableCell>
                                    <TableCell className="text-right">
                                        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-600">
                                            {Math.round(student.total_minutes / 60)}h
                                        </span>
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
                        {Array.from({ length: meta.last_page }, (_, i) => i + 1).map((p) => (
                            <PaginationItem key={p}>
                                <PaginationLink isActive={p === page} onClick={() => setPage(p)} className="cursor-pointer">
                                    {p}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
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
        </div>
    )
}
