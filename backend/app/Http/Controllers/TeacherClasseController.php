<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreTeacherClasseRequest;
use App\Http\Requests\UpdateTeacherClasseRequest;
use App\Http\Resources\TeacherClasseResource;
use App\Models\TeacherClasse;
use App\Repositories\TeacherClasseRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TeacherClasseController extends Controller {

    use ApiResponse;

    public function __construct(private TeacherClasseRepository $teacherClasseRepository) {}

    public function index(Request $request): JsonResponse {

        $this->authorize('viewAny', TeacherClasse::class);

        $assignments = $this->teacherClasseRepository->all(
            teacherId: $request->integer('teacher_id') ?: null,
            classeId: $request->integer('class_id') ?: null,
            academicYearId: $request->integer('academic_year_id') ?: null,
        );

        return $this->successResponse([
            'assignments' => TeacherClasseResource::collection($assignments),
            'meta' => [
                'current_page' => $assignments->currentPage(),
                'last_page' => $assignments->lastPage(),
                'per_page' => $assignments->perPage(),
                'total' => $assignments->total(),
            ],
        ], 'Liste des affectations récupérée avec succès.');
    }

    public function store(StoreTeacherClasseRequest $request): JsonResponse {

        $this->authorize('create', TeacherClasse::class);

        $assignment = $this->teacherClasseRepository->create($request->validated());

        return $this->successResponse([
            'assignment' => new TeacherClasseResource($assignment),
        ], 'Affectation créée avec succès.', 201);
    }

    public function update(UpdateTeacherClasseRequest $request, TeacherClasse $teacherClasse): JsonResponse {

        $this->authorize('update', $teacherClasse);

        $assignment = $this->teacherClasseRepository->update($teacherClasse, $request->validated());

        return $this->successResponse([
            'assignment' => new TeacherClasseResource($assignment),
        ], 'Affectation mise à jour avec succès.');
    }

    public function destroy(TeacherClasse $teacherClasse): JsonResponse {

        $this->authorize('delete', $teacherClasse);

        $this->teacherClasseRepository->delete($teacherClasse);

        return $this->successResponse([], 'Affectation supprimée avec succès.');
    }
}
