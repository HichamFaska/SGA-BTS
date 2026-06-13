import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, CalendarClock, Clock, Loader2, UserX, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import sessionService from "@/services/sessionService"
import absenceService from "@/services/absenceService"
import { formatTime, formatMinutes, computeSessionDuration, getDurationSlices } from "@/lib/session-utils"

export default function RecordAbsencesPage() {
    const { sessionId } = useParams()
    const navigate = useNavigate()
    const { success: toastSuccess, error: toastError } = useToast()

    const [session, setSession] = useState(null)
    const [students, setStudents] = useState([])
    const [absentDurations, setAbsentDurations] = useState({})
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true)
                const [sessionResponse, studentsResponse] = await Promise.all([
                    sessionService.show(Number(sessionId)),
                    sessionService.students(Number(sessionId)),
                ])
                setSession(sessionResponse.data.session)
                setStudents(studentsResponse.data.students ?? [])
            } catch {
                toastError("Impossible de charger les données.")
                navigate("/sessions")
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [sessionId])

    const sessionDuration = session
        ? computeSessionDuration(session.start_time, session.end_time)
        : 0

    const durationSlices = getDurationSlices(sessionDuration)

    const toggleStudent = (studentId) => {
        setAbsentDurations((previousDurations) => {
            if (studentId in previousDurations) {
                const updatedDurations = { ...previousDurations }
                delete updatedDurations[studentId]
                return updatedDurations
            }
            return { ...previousDurations, [studentId]: sessionDuration }
        })
    }

    const updateStudentDuration = (studentId, duration) => {
        setAbsentDurations((previousDurations) => ({ ...previousDurations, [studentId]: duration }))
    }

    const toggleAll = () => {
        const allSelected = students.every((student) => student.id in absentDurations)
        if (allSelected) {
            setAbsentDurations({})
        } else {
            const allAbsent = {}
            students.forEach((student) => { allAbsent[student.id] = sessionDuration })
            setAbsentDurations(allAbsent)
        }
    }

    const absentCount = Object.keys(absentDurations).length

    const handleSubmit = async () => {
        setSubmitting(true)
        try {
            const absences = Object.entries(absentDurations).map(([studentId, duration]) => ({
                student_id: Number(studentId),
                duration,
            }))
            const response = await absenceService.recordAbsences(Number(sessionId), absences)
            toastSuccess(response.message)
            navigate("/sessions")
        } catch (error) {
            toastError(error?.message ?? "Impossible d'enregistrer l'appel.")
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-16">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate("/sessions")}>
                    <ArrowLeft className="size-4" />
                </Button>
                <div className="flex items-center gap-3">
                    <CalendarClock className="size-6 text-muted-foreground" />
                    <div>
                        <h1 className="text-2xl font-bold">Faire l&apos;appel</h1>
                        <p className="text-sm text-muted-foreground">
                            {session?.classe?.name} —{" "}
                            <span className="inline-flex items-center gap-1">
                                <Clock className="size-3" />
                                {formatTime(session?.start_time)} → {formatTime(session?.end_time)}
                            </span>
                            {sessionDuration > 0 && (
                                <span className="ml-2 text-muted-foreground/70">({formatMinutes(sessionDuration)})</span>
                            )}
                        </p>
                    </div>
                </div>
            </div>

            <div className="rounded-xl border">
                <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-2 text-sm font-medium">
                        <Users className="size-4 text-muted-foreground" />
                        {students.length} étudiant{students.length !== 1 ? "s" : ""}
                    </div>
                    <div className="flex items-center gap-3">
                        {absentCount > 0 && (
                            <Badge variant="destructive">
                                {absentCount} absent{absentCount !== 1 ? "s" : ""}
                            </Badge>
                        )}
                        <button
                            onClick={toggleAll}
                            className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
                        >
                            {students.every((student) => student.id in absentDurations) ? "Tout décocher" : "Tout cocher"}
                        </button>
                    </div>
                </div>

                <div className="divide-y">
                    {students.length === 0 && (
                        <div className="flex flex-col items-center gap-3 py-16 text-center">
                            <UserX className="size-10 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">Aucun étudiant inscrit dans cette classe.</p>
                        </div>
                    )}
                    {students.map((student) => {
                        const isAbsent = student.id in absentDurations
                        return (
                            <div
                                key={student.id}
                                className={`flex items-center gap-4 px-4 py-3 transition-colors ${isAbsent ? "bg-destructive/5" : "hover:bg-muted/30"}`}
                            >
                                <Checkbox
                                    checked={isAbsent}
                                    onCheckedChange={() => toggleStudent(student.id)}
                                />
                                <label
                                    className="flex-1 min-w-0 cursor-pointer"
                                    onClick={() => toggleStudent(student.id)}
                                >
                                    <p className={`font-medium ${isAbsent ? "text-destructive" : ""}`}>
                                        {student.first_name} {student.last_name}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{student.matricule}</p>
                                </label>
                                {isAbsent ? (
                                    <Select
                                        value={String(absentDurations[student.id])}
                                        onValueChange={(value) => updateStudentDuration(student.id, Number(value))}
                                    >
                                        <SelectTrigger className="w-32 h-8 text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {durationSlices.map((slice) => (
                                                <SelectItem key={slice} value={String(slice)}>
                                                    {formatMinutes(slice)}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="w-32" />
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3">
                <Button variant="outline" onClick={() => navigate("/sessions")}>
                    Annuler
                </Button>
                <Button onClick={handleSubmit} disabled={submitting || students.length === 0}>
                    {submitting && <Loader2 className="mr-2 size-4 animate-spin" />}
                    Enregistrer l&apos;appel ({absentCount} absent{absentCount !== 1 ? "s" : ""})
                </Button>
            </div>
        </div>
    )
}
