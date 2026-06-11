<?php

namespace App\Http\Controllers;

use App\Http\Requests\BulkEnrollmentRequest;
use App\Http\Requests\StoreEnrollmentRequest;
use App\Http\Requests\UpdateEnrollmentRequest;
use App\Http\Resources\EnrollmentResource;
use App\Models\Enrollment;
use App\Repositories\EnrollmentRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller {

    use ApiResponse;

    public function __construct(private EnrollmentRepository $enrollmentRepository) {}

    public function index(Request $request): JsonResponse {

        $this->authorize('viewAny', Enrollment::class);

        $enrollments = $this->enrollmentRepository->all(
            classeId: $request->integer('class_id') ?: null,
            academicYearId: $request->integer('academic_year_id') ?: null,
            status: $request->input('status'),
            search: $request->input('search'),
        );

        return $this->successResponse([
            'enrollments' => EnrollmentResource::collection($enrollments),
            'meta' => [
                'current_page' => $enrollments->currentPage(),
                'last_page' => $enrollments->lastPage(),
                'per_page' => $enrollments->perPage(),
                'total' => $enrollments->total(),
            ],
        ], 'Liste des inscriptions récupérée avec succès.');
    }

    public function store(StoreEnrollmentRequest $request): JsonResponse {

        $this->authorize('create', Enrollment::class);

        $enrollment = $this->enrollmentRepository->create($request->validated());

        $enrollment->load(['student', 'classe', 'academicYear']);

        return $this->successResponse([
            'enrollment' => new EnrollmentResource($enrollment),
        ], 'Inscription créée avec succès.', 201);
    }

    public function show(Enrollment $enrollment): JsonResponse {

        $this->authorize('view', $enrollment);

        $enrollment->load(['student', 'classe', 'academicYear']);

        return $this->successResponse([
            'enrollment' => new EnrollmentResource($enrollment),
        ], 'Inscription récupérée avec succès.');
    }

    public function update(UpdateEnrollmentRequest $request, Enrollment $enrollment): JsonResponse {

        $this->authorize('update', $enrollment);

        $enrollment = $this->enrollmentRepository->update($enrollment, $request->validated());

        $enrollment->load(['student', 'classe', 'academicYear']);

        return $this->successResponse([
            'enrollment' => new EnrollmentResource($enrollment),
        ], 'Inscription mise à jour avec succès.');
    }

    public function destroy(Enrollment $enrollment): JsonResponse {

        $this->authorize('delete', $enrollment);

        $this->enrollmentRepository->delete($enrollment);

        return $this->successResponse([], 'Inscription supprimée avec succès.');
    }

    public function availableStudents(Request $request): JsonResponse {

        $this->authorize('create', Enrollment::class);

        $request->validate([
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
        ]);

        $students = $this->enrollmentRepository->availableStudents(
            classId: $request->integer('class_id'),
            academicYearId: $request->integer('academic_year_id'),
        );

        return $this->successResponse(['students' => $students]);
    }

    public function bulkStore(BulkEnrollmentRequest $request): JsonResponse {

        $this->authorize('create', Enrollment::class);

        $count = $this->enrollmentRepository->bulkCreate(
            classId: $request->integer('class_id'),
            academicYearId: $request->integer('academic_year_id'),
            studentIds: $request->input('student_ids'),
        );

        return $this->successResponse(
            ['count' => $count],
            "{$count} inscription(s) créée(s) avec succès.",
            201
        );
    }
}
