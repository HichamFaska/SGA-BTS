import { useEffect, useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
    Pagination, PaginationContent, PaginationItem,
    PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"
import statsService from "@/services/statsService"

export default function StudentsOverThresholdPage() {
    const [searchParams] = useSearchParams()
    const academicYearId = searchParams.get("academic_year_id")

    const [students, setStudents] = useState([])
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        setLoading(true)
        statsService.studentsOverThreshold(page, academicYearId)
            .then((res) => {
                setStudents(res.data.students)
                setMeta(res.data.meta)
            })
            .finally(() => setLoading(false))
    }, [page, academicYearId])

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/dashboard"><ArrowLeft className="size-4" /></Link>
                </Button>
                <AlertTriangle className="size-6 text-red-500" />
                <div>
                    <h1 className="text-2xl font-bold">Étudiants dépassant le seuil d'absence</h1>
                    <p className="text-sm text-muted-foreground">
                        {meta.total} étudiant{meta.total !== 1 ? "s" : ""}
                    </p>
                </div>
            </div>

            <div className="rounded-xl border overflow-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Étudiant</TableHead>
                            <TableHead>Matricule</TableHead>
                            <TableHead>Classe</TableHead>
                            <TableHead className="text-right">Durée</TableHead>
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
                                    Aucun étudiant ne dépasse le seuil.
                                </TableCell>
                            </TableRow>
                        ) : (
                            students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell className="font-medium">{student.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.matricule}</TableCell>
                                    <TableCell className="text-muted-foreground">{student.class}</TableCell>
                                    <TableCell className="text-right">
                                        <span className="rounded-full bg-red-500/10 px-2.5 py-1 text-xs font-bold text-red-600">
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
