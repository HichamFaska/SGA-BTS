<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Repositories\TeacherStatsRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherStatsController extends Controller {

    use ApiResponse;

    public function __construct(private TeacherStatsRepository $statsRepository) {}

    public function index(Request $request): JsonResponse {
        $year = AcademicYear::current();

        if (!$year) {
            return $this->errorResponse('Aucune année académique disponible.', 404);
        }

        $teacher = $request->user()->teacher;

        return $this->successResponse([
            'academic_year' => ['id' => $year->id, 'name' => $year->name],
            'sessions_count' => $this->statsRepository->countSessions($teacher, $year),
            'absences_today' => $this->statsRepository->countAbsencesToday($teacher),
            'absences_this_week' => $this->statsRepository->countAbsencesThisWeek($teacher),
            'absences_this_month' => $this->statsRepository->countAbsencesThisMonth($teacher),
            'absences_this_year' => $this->statsRepository->countAbsencesThisYear($teacher, $year),
            'attendance_rate' => $this->statsRepository->attendanceRate($teacher, $year),
            'absences_by_class' => $this->statsRepository->absencesByClass($teacher, $year),
            'top_absent_students' => $this->statsRepository->topAbsentStudents($teacher, $year),
        ]);
    }
}
