<?php

namespace App\Http\Controllers;

use App\Models\AcademicYear;
use App\Repositories\AcademicYearRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class AcademicYearController extends Controller {

    use ApiResponse;

    public function __construct(private AcademicYearRepository $academicYearRepository) {}

    public function list(): JsonResponse {

        $this->authorize('viewAny', AcademicYear::class);

        $years = $this->academicYearRepository->list();

        return $this->successResponse([
            'academic_years' => $years,
        ], 'Liste des années académiques récupérée avec succès.');
    }
}
