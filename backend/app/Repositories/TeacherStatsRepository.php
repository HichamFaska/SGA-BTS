<?php

namespace App\Repositories;

use App\Enums\EnrollmentStatusEnum;
use App\Models\AcademicYear;
use App\Models\Absence;
use App\Models\Classe;
use App\Models\Enrollment;
use App\Models\Session;
use App\Models\Student;
use App\Models\Teacher;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TeacherStatsRepository {

    public function countSessions(Teacher $teacher, AcademicYear $year): int {
        return $teacher->courseSessions()
            ->whereBetween('session_date', [$year->start_date, $year->end_date])
            ->count();
    }

    public function countAbsencesToday(Teacher $teacher): int {
        $today = now()->toDateString();

        return Absence::forTeacherSessions($teacher->id)
            ->fromDate($today)
            ->toDate($today)
            ->count();
    }

    public function countAbsencesThisWeek(Teacher $teacher): int {
        return Absence::forTeacherSessions($teacher->id)
            ->fromDate(now()->startOfWeek()->toDateString())
            ->toDate(now()->endOfWeek()->toDateString())
            ->count();
    }

    public function countAbsencesThisMonth(Teacher $teacher): int {
        return Absence::forTeacherSessions($teacher->id)
            ->fromDate(now()->startOfMonth()->toDateString())
            ->toDate(now()->endOfMonth()->toDateString())
            ->count();
    }

    public function countAbsencesThisYear(Teacher $teacher, AcademicYear $year): int {
        return Absence::forTeacherSessions($teacher->id)
            ->fromDate($year->start_date->toDateString())
            ->toDate($year->end_date->toDateString())
            ->count();
    }

    public function attendanceRate(Teacher $teacher, AcademicYear $year): array {
        $sessionsPerClass = Session::where('teacher_id', $teacher->id)
            ->whereBetween('session_date', [$year->start_date, $year->end_date])
            ->select('class_id', DB::raw('COUNT(*) as sessions_count'))
            ->groupBy('class_id')
            ->pluck('sessions_count', 'class_id');

        if ($sessionsPerClass->isEmpty()) {
            return ['presence' => 100, 'absence' => 0];
        }

        $enrolledPerClass = Enrollment::active()
            ->forYear($year->id)
            ->whereIn('class_id', $sessionsPerClass->keys())
            ->select('class_id', DB::raw('COUNT(*) as enrolled_count'))
            ->groupBy('class_id')
            ->pluck('enrolled_count', 'class_id');

        $expected = $sessionsPerClass->sum(fn($sessions, $classId) => $sessions * ($enrolledPerClass[$classId] ?? 0));

        if ($expected === 0) {
            return [
                'presence' => 100,
                'absence' => 0
            ];
        }

        $absences = Absence::forTeacherSessions($teacher->id)
            ->fromDate($year->start_date->toDateString())
            ->toDate($year->end_date->toDateString())
            ->count();

        $presence = max(0, min(100, (int) round((1 - $absences / $expected) * 100)));

        return ['presence' => $presence, 'absence' => 100 - $presence];
    }

    public function topAbsentStudents(Teacher $teacher, AcademicYear $year, int $limit = 5): Collection {
        return Student::query()
            ->select(
                'students.id',
                'students.matricule',
                'students.first_name',
                'students.last_name',
                DB::raw('COUNT(absences.id) as absences_count')
            )
            ->addSelect(['class_name' => Enrollment::query()
                ->join('classes', 'classes.id', '=', 'enrollments.class_id')
                ->whereColumn('enrollments.student_id', 'students.id')
                ->where('enrollments.status', EnrollmentStatusEnum::Active)
                ->orderByDesc('enrollments.id')
                ->limit(1)
                ->select('classes.name')
            ])
            ->join('absences', 'absences.student_id', '=', 'students.id')
            ->join('course_sessions', 'course_sessions.id', '=', 'absences.session_id')
            ->where('course_sessions.teacher_id', $teacher->id)
            ->whereBetween('course_sessions.session_date', [$year->start_date, $year->end_date])
            ->groupBy('students.id', 'students.matricule', 'students.first_name', 'students.last_name')
            ->orderByDesc(DB::raw('COUNT(absences.id)'))
            ->limit($limit)
            ->get()
            ->map(fn($student) => [
                'id' => $student->id,
                'matricule' => $student->matricule,
                'name' => "{$student->first_name} {$student->last_name}",
                'class' => $student->class_name ?? '—',
                'absences_count' => (int) $student->absences_count,
            ]);
    }

    public function absencesByClass(Teacher $teacher, AcademicYear $year): Collection {
        return Classe::select(
                'classes.name as class',
                DB::raw('COUNT(absences.id) as absences')
            )
            ->join('course_sessions', 'course_sessions.class_id', '=', 'classes.id')
            ->join('absences', 'absences.session_id', '=', 'course_sessions.id')
            ->where('course_sessions.teacher_id', $teacher->id)
            ->whereBetween('course_sessions.session_date', [$year->start_date, $year->end_date])
            ->groupBy('classes.id', 'classes.name')
            ->orderByDesc(DB::raw('COUNT(absences.id)'))
            ->get()
            ->map(fn($row) => [
                'class' => $row->class,
                'absences' => (int) $row->absences,
            ]);
    }
}
