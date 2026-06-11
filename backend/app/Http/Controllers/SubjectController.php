<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSubjectRequest;
use App\Http\Requests\UpdateSubjectRequest;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use App\Repositories\SubjectRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller {

    use ApiResponse;

    public function __construct(private SubjectRepository $subjectRepository) {}

    public function index(Request $request): JsonResponse {

        $this->authorize('viewAny', Subject::class);

        $subjects = $this->subjectRepository->all(
            search: $request->input('search'),
        );

        return $this->successResponse([
            'subjects' => SubjectResource::collection($subjects),
            'meta' => [
                'current_page' => $subjects->currentPage(),
                'last_page' => $subjects->lastPage(),
                'per_page' => $subjects->perPage(),
                'total' => $subjects->total(),
            ],
        ], 'Liste des matières récupérée avec succès.');
    }

    public function list(): JsonResponse {

        $this->authorize('viewAny', Subject::class);

        $subjects = $this->subjectRepository->list();

        return $this->successResponse([
            'subjects' => SubjectResource::collection($subjects),
        ], 'Liste des matières récupérée avec succès.');
    }

    public function store(StoreSubjectRequest $request): JsonResponse {

        $this->authorize('create', Subject::class);

        $subject = $this->subjectRepository->create($request->validated());

        return $this->successResponse([
            'subject' => new SubjectResource($subject),
        ], 'Matière créée avec succès.', 201);
    }

    public function show(Subject $subject): JsonResponse {

        $this->authorize('view', $subject);

        return $this->successResponse([
            'subject' => new SubjectResource($subject),
        ], 'Matière récupérée avec succès.');
    }

    public function update(UpdateSubjectRequest $request, Subject $subject): JsonResponse {

        $this->authorize('update', $subject);

        $subject = $this->subjectRepository->update($subject, $request->validated());

        return $this->successResponse([
            'subject' => new SubjectResource($subject),
        ], 'Matière mise à jour avec succès.');
    }

    public function destroy(Subject $subject): JsonResponse {

        $this->authorize('delete', $subject);

        $this->subjectRepository->delete($subject);

        return $this->successResponse([], 'Matière supprimée avec succès.');
    }
}
