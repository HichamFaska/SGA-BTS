<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAcademicYearRequest;
use App\Http\Requests\UpdateAcademicYearRequest;
use App\Http\Resources\AcademicYearResource;
use App\Models\AcademicYear;
use App\Repositories\AcademicYearRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AcademicYearController extends Controller {

    use ApiResponse;

    public function __construct(private AcademicYearRepository $academicYearRepository) {}

    public function index(Request $request): JsonResponse {

        $this->authorize('viewAny', AcademicYear::class);

        $years = $this->academicYearRepository->all(
            search: $request->input('search'),
        );

        return $this->successResponse([
            'academic_years' => AcademicYearResource::collection($years),
            'meta' => [
                'current_page' => $years->currentPage(),
                'last_page' => $years->lastPage(),
                'per_page' => $years->perPage(),
                'total' => $years->total(),
            ],
        ], 'Liste des années académiques récupérée avec succès.');
    }

    public function list(): JsonResponse {

        $this->authorize('viewAny', AcademicYear::class);

        $years = $this->academicYearRepository->list();

        return $this->successResponse([
            'academic_years' => AcademicYearResource::collection($years),
        ], 'Liste des années académiques récupérée avec succès.');
    }

    public function store(StoreAcademicYearRequest $request): JsonResponse {

        $this->authorize('create', AcademicYear::class);

        $year = $this->academicYearRepository->create($request->validated());

        return $this->successResponse([
            'academic_year' => new AcademicYearResource($year),
        ], 'Année académique créée avec succès.', 201);
    }

    public function show(AcademicYear $academicYear): JsonResponse {

        $this->authorize('view', $academicYear);

        return $this->successResponse([
            'academic_year' => new AcademicYearResource($academicYear),
        ], 'Année académique récupérée avec succès.');
    }

    public function update(UpdateAcademicYearRequest $request, AcademicYear $academicYear): JsonResponse {

        $this->authorize('update', $academicYear);

        $year = $this->academicYearRepository->update($academicYear, $request->validated());

        return $this->successResponse([
            'academic_year' => new AcademicYearResource($year),
        ], 'Année académique mise à jour avec succès.');
    }

    public function destroy(AcademicYear $academicYear): JsonResponse {

        $this->authorize('delete', $academicYear);

        $this->academicYearRepository->delete($academicYear);

        return $this->successResponse([], 'Année académique supprimée avec succès.');
    }
}
