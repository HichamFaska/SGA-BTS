import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Users, GraduationCap, CalendarX, CalendarDays, CalendarRange, Clock, Loader2, AlertTriangle, TrendingDown, LayoutDashboard, X } from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, Tooltip, Legend, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useAuth } from "@/hooks/useAuth"
import statsService from "@/services/statsService"
import academicYearService from "@/services/academicYearService"

const COLORS = ["#22c55e", "#ef4444"]

const barConfig = {
    absences: { label: "Absences", color: "hsl(var(--chart-1))" },
}

const teacherBarConfig = {
    absences: { label: "Absences", color: "hsl(var(--chart-2))" },
}

const generateColor = (index, total) => `hsl(${Math.round((index * 360) / Math.max(total, 1))}, 65%, 55%)`

const pieConfig = {
    "Justifiées": { label: "Justifiées", color: "#22c55e" },
    "Non justifiées": { label: "Non justifiées", color: "#ef4444" },
}

function StatCard({ icon: Icon, label, value, loading, to }) {
    const card = (
        <Card className={`border rounded-none shadow-none ring-0 ${to ? "transition-colors hover:bg-muted/50 cursor-pointer" : ""}`}>
            <CardContent className="flex items-center gap-4 pt-6">
                <div className="rounded-xl bg-muted p-3">
                    <Icon className="size-6 text-muted-foreground" />
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    {loading
                        ? <div className="h-7 w-16 bg-muted animate-pulse rounded mt-1" />
                        : <p className="text-2xl font-bold">{value}</p>
                    }
                </div>
            </CardContent>
        </Card>
    )

    return to ? <Link to={to}>{card}</Link> : card
}

const toLocalDate = (date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

function Dashboard() {
    const { user } = useAuth()
    const [stats, setStats] = useState(null)

    const now = new Date()
    const yesterday = toLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1))

    const dayOfWeek = now.getDay() // 0 = dimanche
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const startOfWeek = toLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset))
    const endOfWeek = toLocalDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + mondayOffset + 6))

    const startOfMonth = toLocalDate(new Date(now.getFullYear(), now.getMonth(), 1))
    const endOfMonth = toLocalDate(new Date(now.getFullYear(), now.getMonth() + 1, 0))

    const startOfYear = toLocalDate(new Date(now.getFullYear(), 0, 1))
    const endOfYear = toLocalDate(new Date(now.getFullYear(), 11, 31))
    const [loading, setLoading] = useState(true)
    const [thresholdAlertDismissed, setThresholdAlertDismissed] = useState(false)
    const [consecutiveAlertDismissed, setConsecutiveAlertDismissed] = useState(false)
    const [academicYears, setAcademicYears] = useState([])
    const [academicYearId, setAcademicYearId] = useState(null)

    useEffect(() => {
        academicYearService.listAll()
            .then((res) => setAcademicYears(res.data.academic_years ?? []))
            .catch(() => {})
    }, [])

    useEffect(() => {
        if (user?.role !== "admin") return
        setLoading(true)
        statsService.index(academicYearId)
            .then((res) => {
                const data = res.data
                data.absences_by_status = data.absences_by_status.map((item, index) => ({
                    ...item,
                    fill: COLORS[index],
                }))
                setStats(data)
                if (!academicYearId && data.academic_year) {
                    setAcademicYearId(data.academic_year.id)
                }
            })
            .finally(() => setLoading(false))
    }, [user, academicYearId])

    if (user?.role !== "admin") {
        return (
            <section className="space-y-6">
                <h1 className="text-2xl font-bold">Tableau de bord</h1>
                <p className="text-muted-foreground">Bienvenue, {user?.first_name}.</p>
            </section>
        )
    }

    return (
        <section className="space-y-8">
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="size-6" />
                    <h1 className="text-2xl font-bold">Tableau de bord</h1>
                </div>
                <Select
                    value={academicYearId ? String(academicYearId) : undefined}
                    onValueChange={(selectedValue) => setAcademicYearId(Number(selectedValue))}
                >
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="Année académique" />
                    </SelectTrigger>
                    <SelectContent>
                        {academicYears.map((academicYear) => (
                            <SelectItem key={academicYear.id} value={String(academicYear.id)}>{academicYear.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {!loading && (stats?.students_over_threshold_count > 0 || stats?.students_consecutive_absences_count > 0) && (
                <div className="space-y-3">
                    {stats?.students_over_threshold_count > 0 && !thresholdAlertDismissed && (
                        <Alert variant="destructive" className="flex items-start gap-3 rounded-lg border-red-200 bg-red-50 py-3 pr-12 [&>svg]:hidden">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                                <AlertTriangle className="size-4.5 text-red-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <AlertTitle className="text-red-800">Étudiants dépassant le seuil d'absence</AlertTitle>
                                <AlertDescription className="text-red-700/80">
                                    {stats.students_over_threshold_count} étudiant{stats.students_over_threshold_count !== 1 ? "s" : ""} {stats.students_over_threshold_count !== 1 ? "ont" : "a"} dépassé le seuil d'absence autorisé.
                                </AlertDescription>
                            </div>
                            <Button asChild variant="outline" size="sm" className="shrink-0 self-center border-red-300 text-red-700 hover:bg-red-100 hover:text-red-800">
                                <Link to={`/stats/over-threshold?academic_year_id=${academicYearId ?? ""}`}>Voir la liste</Link>
                            </Button>
                            <button
                                onClick={() => setThresholdAlertDismissed(true)}
                                className="absolute right-3 top-3 text-red-600/60 hover:text-red-700"
                                aria-label="Fermer l'alerte"
                            >
                                <X className="size-4" />
                            </button>
                        </Alert>
                    )}

                    {stats?.students_consecutive_absences_count > 0 && !consecutiveAlertDismissed && (
                        <Alert className="flex items-start gap-3 rounded-lg border-amber-200 bg-amber-50 py-3 pr-12 [&>svg]:hidden">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                                <TrendingDown className="size-4.5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <AlertTitle className="text-amber-800">Absences sur 4 séances consécutives</AlertTitle>
                                <AlertDescription className="text-amber-700/80">
                                    {stats.students_consecutive_absences_count} étudiant{stats.students_consecutive_absences_count !== 1 ? "s" : ""} {stats.students_consecutive_absences_count !== 1 ? "ont" : "a"} été absent{stats.students_consecutive_absences_count !== 1 ? "s" : ""} lors de 4 séances consécutives.
                                </AlertDescription>
                            </div>
                            <Button asChild variant="outline" size="sm" className="shrink-0 self-center border-amber-300 text-amber-700 hover:bg-amber-100 hover:text-amber-800">
                                <Link to={`/stats/consecutive-absences?academic_year_id=${academicYearId ?? ""}`}>Voir la liste</Link>
                            </Button>
                            <button
                                onClick={() => setConsecutiveAlertDismissed(true)}
                                className="absolute right-3 top-3 text-amber-600/60 hover:text-amber-700"
                                aria-label="Fermer l'alerte"
                            >
                                <X className="size-4" />
                            </button>
                        </Alert>
                    )}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={CalendarX} label="Total absences" value={stats?.totals.absences} loading={loading} />
                <StatCard icon={GraduationCap} label="Total étudiants" value={stats?.totals.students} loading={loading} />
                <StatCard icon={Users} label="Total professeurs" value={stats?.totals.teachers} loading={loading} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={CalendarDays}
                    label="Absences d'hier"
                    value={stats?.absences_yesterday}
                    loading={loading}
                    to={`/absences?date_from=${yesterday}&date_to=${yesterday}`}
                />
                <StatCard
                    icon={CalendarRange}
                    label="Absences cette semaine"
                    value={stats?.absences_this_week}
                    loading={loading}
                    to={`/absences?date_from=${startOfWeek}&date_to=${endOfWeek}`}
                />
                <StatCard
                    icon={CalendarRange}
                    label="Absences ce mois"
                    value={stats?.absences_this_month}
                    loading={loading}
                    to={`/absences?date_from=${startOfMonth}&date_to=${endOfMonth}`}
                />
                <StatCard
                    icon={CalendarRange}
                    label="Absences cette année"
                    value={stats?.absences_this_year}
                    loading={loading}
                    to={`/absences?date_from=${startOfYear}&date_to=${endOfYear}`}
                />
            </div>

            <div className="grid grid-cols-1 gap-4">
                <Link to="/stats/absence-hours">
                    <Card className="border rounded-none shadow-none ring-0 transition-colors hover:bg-muted/50 cursor-pointer">
                        <CardContent className="flex items-center gap-4 pt-6">
                            <div className="rounded-xl bg-red-500/10 p-3">
                                <Clock className="size-6 text-red-600" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm text-muted-foreground">Plus grand nombre d'heures d'absence</p>
                                {loading ? (
                                    <div className="h-7 w-16 bg-muted animate-pulse rounded mt-1" />
                                ) : (
                                    <div className="flex items-baseline gap-2">
                                        <p className="text-2xl font-bold text-red-600">
                                            {Math.round((stats?.top_absence_hours?.total_minutes ?? 0) / 60)}h
                                        </p>
                                        {stats?.top_absence_hours?.name && (
                                            <p className="text-xs text-muted-foreground truncate">{stats.top_absence_hours.name}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    <Card className="border rounded-none shadow-none ring-0">
                        <CardHeader>
                            <CardTitle className="text-base">Absences par classe</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats?.absences_by_class?.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée disponible.</p>
                            ) : (
                                <ChartContainer config={barConfig} className="h-64 w-full">
                                    <BarChart data={stats?.absences_by_class} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis dataKey="class" tick={{ fontSize: 12 }} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="absences" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border rounded-none shadow-none ring-0">
                        <CardHeader>
                            <CardTitle className="text-base">Répartition justifiées / non justifiées</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center gap-4">
                            {stats?.absences_by_status?.every((s) => s.count === 0) ? (
                                <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée disponible.</p>
                            ) : (
                                <>
                                    <ChartContainer config={pieConfig} className="h-56 w-full">
                                        <PieChart>
                                            <Pie
                                                data={stats?.absences_by_status}
                                                dataKey="count"
                                                nameKey="status"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={90}
                                                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                                                labelLine={false}
                                            />
                                            <Tooltip formatter={(value, name) => [value, name]} />
                                            <Legend />
                                        </PieChart>
                                    </ChartContainer>
                                </>
                            )}
                        </CardContent>
                    </Card>

                </div>
            )}

            {!loading && (
                <Card className="border rounded-none shadow-none ring-0">
                    <CardHeader>
                        <CardTitle className="text-base">Absences par professeur / matière</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats?.absences_by_teacher?.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-8">Aucune donnée disponible.</p>
        ) : (
                            <div className="space-y-4">
                                <ChartContainer config={teacherBarConfig} className="h-72 w-full">
                                    <BarChart
                                        data={stats?.absences_by_teacher?.map((row) => ({
                                            ...row,
                                            label: `${row.teacher} (${row.subject})`,
                                        }))}
                                        margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
                                    >
                                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                        <XAxis dataKey="teacher" tick={false} axisLine={false} />
                                        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="absences" radius={[4, 4, 0, 0]}>
                                            {stats?.absences_by_teacher?.map((row, index) => (
                                                <Cell key={row.teacher} fill={generateColor(index, stats.absences_by_teacher.length)} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ChartContainer>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-2 border-t pt-4">
                                    {stats.absences_by_teacher.map((row, index) => (
                                        <div key={row.teacher} className="flex items-center gap-2 text-xs">
                                            <span
                                                className="size-2.5 shrink-0 rounded-xs"
                                                style={{ backgroundColor: generateColor(index, stats.absences_by_teacher.length) }}
                                            />
                                            <span className="flex-1 truncate text-muted-foreground">
                                                {row.teacher} <span className="text-muted-foreground/70">({row.subject})</span>
                                            </span>
                                            <span className="shrink-0 font-medium tabular-nums">{row.absences}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </section>
    )
}

export default Dashboard
