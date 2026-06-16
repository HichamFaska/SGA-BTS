<?php

namespace App\Repositories;

use App\Enums\EnrollmentStatusEnum;
use App\Models\AcademicYear;
use App\Models\Absence;
use App\Models\Classe;
use App\Models\Enrollment;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\TeacherClasse;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Pagination\Paginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class AdminStatsRepository {

    public function resolveAcademicYear(?int $academicYearId = null): ?AcademicYear {
        return $academicYearId
            ? AcademicYear::find($academicYearId)
            : AcademicYear::current();
    }

    public function totals(AcademicYear $year): array {
        return [
            'absences' => Absence::fromDate($year->start_date->toDateString())
                ->toDate($year->end_date->toDateString())
                ->count(),
            'students' => Enrollment::forYear($year->id)->distinct('student_id')->count('student_id'),
            'teachers' => TeacherClasse::where('academic_year_id', $year->id)->distinct('teacher_id')->count('teacher_id'),
        ];
    }

    public function countAbsencesYesterday(): int {
        $yesterday = now()->subDay()->toDateString();

        return Absence::fromDate($yesterday)->toDate($yesterday)->count();
    }

    public function countAbsencesThisWeek(): int {
        return Absence::fromDate(now()->startOfWeek()->toDateString())
            ->toDate(now()->endOfWeek()->toDateString())
            ->count();
    }

    public function countAbsencesThisMonth(): int {
        return Absence::fromDate(now()->startOfMonth()->toDateString())
            ->toDate(now()->endOfMonth()->toDateString())
            ->count();
    }

    public function countAbsencesThisYear(): int {
        return Absence::fromDate(now()->startOfYear()->toDateString())
            ->toDate(now()->endOfYear()->toDateString())
            ->count();
    }

    public function absencesByClass(AcademicYear $year): Collection {
        return Classe::select(
                'classes.name as class',
                DB::raw('COUNT(absences.id) as absences')
            )
            ->join('course_sessions', 'course_sessions.class_id', '=', 'classes.id')
            ->join('absences', 'absences.session_id', '=', 'course_sessions.id')
            ->whereBetween('course_sessions.session_date', [$year->start_date, $year->end_date])
            ->groupBy('classes.id', 'classes.name')
            ->orderByDesc(DB::raw('COUNT(absences.id)'))
            ->get()
            ->map(fn($row) => [
                'class' => $row->class,
                'absences' => (int) $row->absences,
            ]);
    }

    public function absencesByTeacher(AcademicYear $year): Collection {
        return Teacher::select(
                DB::raw("users.first_name || ' ' || users.last_name as teacher"),
                'subjects.name as subject',
                DB::raw('COUNT(absences.id) as absences')
            )
            ->join('users', 'users.id', '=', 'teachers.user_id')
            ->leftJoin('subjects', 'subjects.id', '=', 'teachers.subject_id')
            ->leftJoin('course_sessions', function ($join) use ($year) {
                $join->on('course_sessions.teacher_id', '=', 'teachers.id')
                    ->whereBetween('course_sessions.session_date', [$year->start_date, $year->end_date]);
            })
            ->leftJoin('absences', 'absences.session_id', '=', 'course_sessions.id')
            ->groupBy('teachers.id', 'users.first_name', 'users.last_name', 'subjects.name')
            ->orderByDesc(DB::raw('COUNT(absences.id)'))
            ->get()
            ->map(fn($row) => [
                'teacher' => $row->teacher,
                'subject' => $row->subject ?? '—',
                'absences' => (int) $row->absences,
            ]);
    }

    public function absencesByStatus(AcademicYear $year): array {
        $query = fn() => Absence::fromDate($year->start_date->toDateString())
            ->toDate($year->end_date->toDateString());

        return [
            ['status' => 'Justifiées', 'count' => $query()->where('status', 'justifiée')->count()],
            ['status' => 'Non justifiées', 'count' => $query()->where('status', 'non justifiée')->count()],
        ];
    }

    public function countStudentsOverThreshold(AcademicYear $year): int {
        return $this->studentsOverThresholdQuery($year)->count();
    }

    public function studentsOverThreshold(AcademicYear $year, int $perPage = 10): LengthAwarePaginator {
        return $this->studentsOverThresholdQuery($year)
            ->orderByDesc('total_duration')
            ->paginate($perPage)
            ->through(fn($student) => [
                'id' => $student->id,
                'matricule' => $student->matricule,
                'name' => "{$student->first_name} {$student->last_name}",
                'class' => $student->class_name ?? '—',
                'total_minutes' => (int) $student->total_duration,
            ]);
    }

    public function countStudentsWithConsecutiveAbsences(AcademicYear $year): int {
        return $this->consecutiveAbsencesCollection($year)->count();
    }

    public function studentsWithConsecutiveAbsences(AcademicYear $year, int $perPage = 10): LengthAwarePaginator {
        $collection = $this->consecutiveAbsencesCollection($year);

        $page = LengthAwarePaginator::resolveCurrentPage();
        $items = $collection->forPage($page, $perPage)->values();

        return new LengthAwarePaginator($items, $collection->count(), $perPage, $page, [
            'path' => Paginator::resolveCurrentPath(),
            'query' => request()->query(),
        ]);
    }

    public function studentsAbsenceHours(
        ?string $search = null,
        ?int $classeId = null,
        ?int $filiereId = null,
        ?int $academicYearId = null,
        int $perPage = 10,
    ): LengthAwarePaginator {
        return Student::query()
            ->select('students.*', DB::raw('COALESCE(SUM(absences.duration), 0) as total_duration'))
            ->addSelect(['class_name' => $this->activeClassNameSubquery()])
            ->leftJoin('absences', 'absences.student_id', '=', 'students.id')
            ->search($search)
            ->inClasse($classeId)
            ->inFiliere($filiereId)
            ->inAcademicYear($academicYearId)
            ->groupBy('students.id')
            ->havingRaw('COALESCE(SUM(absences.duration), 0) > 0')
            ->orderByDesc('total_duration')
            ->paginate($perPage)
            ->through(fn($student) => [
                'id' => $student->id,
                'matricule' => $student->matricule,
                'name' => "{$student->first_name} {$student->last_name}",
                'class' => $student->class_name ?? '—',
                'total_minutes' => (int) $student->total_duration,
            ]);
    }

    public function topAbsenceHours(): array {
        $student = Student::query()
            ->select('students.*', DB::raw('COALESCE(SUM(absences.duration), 0) as total_duration'))
            ->leftJoin('absences', 'absences.student_id', '=', 'students.id')
            ->groupBy('students.id')
            ->havingRaw('COALESCE(SUM(absences.duration), 0) > 0')
            ->orderByDesc('total_duration')
            ->first();

        return [
            'name' => $student ? "{$student->first_name} {$student->last_name}" : null,
            'total_minutes' => $student ? (int) $student->total_duration : 0,
        ];
    }

    private function studentsOverThresholdQuery(AcademicYear $year) {
        return Student::query()
            ->select('students.*', DB::raw('COALESCE(SUM(absences.duration), 0) as total_duration'))
            ->addSelect(['class_name' => $this->activeClassNameSubquery()])
            ->leftJoin('absences', 'absences.student_id', '=', 'students.id')
            ->leftJoin('course_sessions', 'course_sessions.id', '=', 'absences.session_id')
            ->where(function ($q) use ($year) {
                $q->whereNull('absences.id')
                  ->orWhereBetween('course_sessions.session_date', [$year->start_date, $year->end_date]);
            })
            ->groupBy('students.id')
            ->havingRaw('COALESCE(SUM(absences.duration), 0) >= ?', [config('absences.threshold_minutes')]);
    }

    private function activeClassNameSubquery() {
        return Enrollment::query()
            ->join('classes', 'classes.id', '=', 'enrollments.class_id')
            ->whereColumn('enrollments.student_id', 'students.id')
            ->where('enrollments.status', EnrollmentStatusEnum::Active)
            ->orderByDesc('enrollments.id')
            ->limit(1)
            ->select('classes.name');
    }

    private function consecutiveAbsencesCollection(AcademicYear $year): Collection {
        $consecutive = config('absences.consecutive_sessions_alert');

        $enrollments = Enrollment::active()
            ->forYear($year->id)
            ->with(['student', 'classe.courseSessions' => fn($q) => $q
                ->whereBetween('session_date', [$year->start_date, $year->end_date])
                ->orderBy('session_date')
                ->orderBy('start_time')])
            ->get();

        $studentIds = $enrollments->pluck('student_id')->unique();

        $absentSessionIdsByStudent = Absence::whereIn('student_id', $studentIds)
            ->get()
            ->groupBy('student_id')
            ->map(fn($group) => $group->pluck('session_id')->flip());

        return $enrollments
            ->map(function ($enrollment) use ($absentSessionIdsByStudent) {
                $absentSessionIds = $absentSessionIdsByStudent->get($enrollment->student_id, collect());

                $streak = 0;
                $maxStreak = 0;
                foreach ($enrollment->classe->courseSessions as $session) {
                    if ($absentSessionIds->has($session->id)) {
                        $streak++;
                        $maxStreak = max($maxStreak, $streak);
                    } else {
                        $streak = 0;
                    }
                }

                return [
                    'student' => $enrollment->student,
                    'classe' => $enrollment->classe,
                    'max_streak' => $maxStreak,
                ];
            })
            ->filter(fn($row) => $row['max_streak'] >= $consecutive)
            ->unique(fn($row) => $row['student']->id)
            ->sortByDesc('max_streak')
            ->map(fn($row) => [
                'id' => $row['student']->id,
                'matricule' => $row['student']->matricule,
                'name' => "{$row['student']->first_name} {$row['student']->last_name}",
                'class' => $row['classe']->name,
                'consecutive_absences' => $row['max_streak'],
            ])
            ->values();
    }
}
