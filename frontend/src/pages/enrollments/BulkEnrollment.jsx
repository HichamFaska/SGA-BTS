import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, ClipboardList, Loader2, Search, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import { useToast } from "@/components/ui/use-toast"

import enrollmentService from "@/services/enrollmentService"
import classeService from "@/services/classeService"
import academicYearService from "@/services/academicYearService"
import { useDebounce } from "@/hooks/useDebounce"

export default function BulkEnrollment() {
    const navigate = useNavigate()
    const { success: toastSuccess, error: toastError } = useToast()

    const [classes, setClasses] = useState([])
    const [academicYears, setAcademicYears] = useState([])

    const [classId, setClassId] = useState("")
    const [yearId, setYearId] = useState("")

    const [students, setStudents] = useState([])
    const [selected, setSelected] = useState([])
    const [loadingStudents, setLoadingStudents] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [search, setSearch] = useState("")

    const debouncedSearch = useDebounce(search)

    useEffect(() => {
        Promise.all([
            classeService.listAll(),
            academicYearService.listAll(),
        ]).then(([classeResponse, yearResponse]) => {
            setClasses(classeResponse.data.classes ?? [])
            const years = yearResponse.data.academic_years ?? []
            setAcademicYears(years)
            const current = years.find((year) => year.is_current)
            if (current){
                setYearId(String(current.id))
            }
        }).catch(() => {})
    }, [])

    useEffect(() => {
        if (!classId || !yearId) {
            setStudents([])
            setSelected([])
            return
        }
        setLoadingStudents(true)
        enrollmentService.availableStudents(classId, yearId)
            .then((response) => {
                setStudents(response.data.students ?? [])
                setSelected([])
            })
            .catch(() => toastError("Impossible de charger les étudiants."))
            .finally(() => setLoadingStudents(false))
    }, [classId, yearId])

    const filtered = students.filter((student) => {
        if (!debouncedSearch){
            return true
        }
        const q = debouncedSearch.toLowerCase()
        return (
            student.first_name.toLowerCase().includes(q) ||
            student.last_name.toLowerCase().includes(q) ||
            student.matricule.toLowerCase().includes(q)
        )
    })

    const selectable = filtered.filter((s) => !s.blocked)

    const allVisibleSelected = selectable.length > 0 && selectable.every((s) => selected.includes(s.id))

    const toggleStudent = (id) =>
        setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])

    const toggleAll = (checked) => {
        const ids = selectable.map((s) => s.id)
        setSelected((prev) =>
            checked ? [...new Set([...prev, ...ids])] : prev.filter((id) => !ids.includes(id))
        )
    }

    const classNameById = (id) =>
        classes.find((classe) => String(classe.id) === String(id))?.name ?? "une autre classe"

    const onSubmit = async () => {
        if (selected.length === 0) return
        setSubmitting(true)
        try {
            const response = await enrollmentService.bulkStore({
                class_id: Number(classId),
                academic_year_id: Number(yearId),
                student_ids: selected,
            })
            toastSuccess(response.message)
            navigate("/enrollments")
        } catch (err) {
            if (err?.errors) {
                toastError(Object.values(err.errors).flat().join(" "))
            } else {
                toastError(err?.message ?? "Une erreur est survenue.")
            }
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <TooltipProvider>
        <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => navigate("/enrollments")}>
                    <ArrowLeft className="size-5" />
                </Button>
                <div className="flex items-center gap-3">
                    <Users className="size-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Inscription en masse</h1>
                        <p className="text-sm text-muted-foreground">
                            Choisissez une classe et une année, puis cochez les étudiants à inscrire.
                        </p>
                    </div>
                </div>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Classe</label>
                    <Select value={classId} onValueChange={setClassId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choisir une classe..." />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((classe) => (
                                <SelectItem key={classe.id} value={String(classe.id)}>{classe.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-sm font-medium">Année académique</label>
                    <Select value={yearId} onValueChange={setYearId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Choisir une année..." />
                        </SelectTrigger>
                        <SelectContent>
                            {academicYears.map((year) => (
                                <SelectItem key={year.id} value={String(year.id)}>
                                    {year.name}{year.is_current && " (en cours)"}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Student list */}
            {classId && yearId && (
                <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher un étudiant..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        {selected.length > 0 && (
                            <span className="text-sm text-muted-foreground shrink-0">
                                {selected.length} sélectionné{selected.length > 1 ? "s" : ""}
                            </span>
                        )}
                    </div>

                    {loadingStudents ? (
                        <div className="flex justify-center py-16">
                            <Loader2 className="size-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
                            <ClipboardList className="size-10" />
                            <p className="text-sm">Tous les étudiants sont déjà inscrits dans cette classe.</p>
                        </div>
                    ) : (
                        <div className="rounded-xl border overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <Checkbox
                                                checked={allVisibleSelected}
                                                onCheckedChange={toggleAll}
                                                disabled={selectable.length === 0}
                                            />
                                        </TableHead>
                                        <TableHead>Étudiant</TableHead>
                                        <TableHead>Matricule</TableHead>
                                        <TableHead>Disponibilité</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((student) => (
                                        <TableRow
                                            key={student.id}
                                            className={student.blocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:bg-muted/50"}
                                            onClick={() => !s.blocked && toggleStudent(student.id)}
                                        >
                                            <TableCell>
                                                {student.blocked ? (
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <span>
                                                                <Checkbox checked={false} disabled />
                                                            </span>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            Déjà actif dans {classNameById(student.blocked_class_id)}
                                                        </TooltipContent>
                                                    </Tooltip>
                                                ) : (
                                                    <Checkbox
                                                        checked={selected.includes(student.id)}
                                                        onCheckedChange={() => toggleStudent(student.id)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                )}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {student.first_name} {student.last_name}
                                            </TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground">
                                                {student.matricule}
                                            </TableCell>
                                            <TableCell>
                                                {student.blocked && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Déjà actif ailleurs
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Footer actions */}
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <Button variant="outline" onClick={() => navigate("/enrollments")}>
                            Annuler
                        </Button>
                        <Button onClick={onSubmit} disabled={selected.length === 0 || submitting}>
                            {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                            Inscrire {selected.length > 0 ? `(${selected.length})` : ""}
                        </Button>
                    </div>
                </div>
            )}
        </div>
        </TooltipProvider>
    )
}
