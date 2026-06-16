<?php

namespace App\Http\Controllers;

use App\Repositories\AdminStatsRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminStatsController extends Controller {

    use ApiResponse;

    public function __construct(private AdminStatsRepository $statsRepository) {}

    public function index(Request $request): JsonResponse {
        $year = $this->statsRepository->resolveAcademicYear($request->integer('academic_year_id') ?: null);

        if (!$year) {
            return $this->errorResponse('Aucune année académique disponible.', 404);
        }

        return $this->successResponse([
            'academic_year' => ['id' => $year->id, 'name' => $year->name],
            'totals' => $this->statsRepository->totals($year),
            'absences_by_class' => $this->statsRepository->absencesByClass($year),
            'absences_by_teacher' => $this->statsRepository->absencesByTeacher($year),
            'absences_by_status' => $this->statsRepository->absencesByStatus($year),
            'students_over_threshold_count' => $this->statsRepository->countStudentsOverThreshold($year),
            'students_consecutive_absences_count' => $this->statsRepository->countStudentsWithConsecutiveAbsences($year),
            'absences_yesterday' => $this->statsRepository->countAbsencesYesterday(),
            'absences_this_week' => $this->statsRepository->countAbsencesThisWeek(),
            'absences_this_month' => $this->statsRepository->countAbsencesThisMonth(),
            'absences_this_year' => $this->statsRepository->countAbsencesThisYear(),
            'top_absence_hours' => $this->statsRepository->topAbsenceHours(),
        ]);
    }

    public function studentsOverThreshold(Request $request): JsonResponse {
        $year = $this->statsRepository->resolveAcademicYear($request->integer('academic_year_id') ?: null);

        if (!$year) {
            return $this->errorResponse('Aucune année académique disponible.', 404);
        }

        $students = $this->statsRepository->studentsOverThreshold($year);

        return $this->successResponse([
            'students' => $students->items(),
            'meta' => [
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total(),
            ],
        ]);
    }

    public function studentsConsecutiveAbsences(Request $request): JsonResponse {
        $year = $this->statsRepository->resolveAcademicYear($request->integer('academic_year_id') ?: null);

        if (!$year) {
            return $this->errorResponse('Aucune année académique disponible.', 404);
        }

        $students = $this->statsRepository->studentsWithConsecutiveAbsences($year);

        return $this->successResponse([
            'students' => $students->items(),
            'meta' => [
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total(),
            ],
        ]);
    }

    public function studentsAbsenceHours(Request $request): JsonResponse {
        $students = $this->statsRepository->studentsAbsenceHours(
            search: $request->input('search'),
            classeId: $request->integer('class_id') ?: null,
            filiereId: $request->integer('filiere_id') ?: null,
            academicYearId: $request->integer('academic_year_id') ?: null,
        );

        return $this->successResponse([
            'students' => $students->items(),
            'meta' => [
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total(),
            ],
        ]);
    }
}
