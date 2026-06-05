<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreStudentRequest;
use App\Http\Requests\UpdateStudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use App\Repositories\StudentRepository;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StudentController extends Controller {

    use ApiResponse;

    private StudentRepository $studentRepository;

    public function __construct(StudentRepository $studentRepository) {
        $this->studentRepository = $studentRepository;
    }

    public function index(Request $request): JsonResponse {

        $this->authorize('viewAny', Student::class);

        $students = $this->studentRepository->all(
            search: $request->input('search'),
            classId: $request->integer('class_id') ?: null,
        );

        return $this->successResponse([
            'students' => StudentResource::collection($students),
            'meta' => [
                'current_page' => $students->currentPage(),
                'last_page' => $students->lastPage(),
                'per_page' => $students->perPage(),
                'total' => $students->total(),
            ],
        ], 'Liste des étudiants récupérée avec succès.', 200);
    }

    public function store(StoreStudentRequest $request): JsonResponse {

        $this->authorize('create', Student::class);

        $credentials = $request->validated();

        $student = $this->studentRepository->create($credentials);

        return $this->successResponse([
            'student' => new StudentResource($student),
        ], 'Étudiant créé avec succès.', 201);
    }

    public function show(Student $student): JsonResponse {

        $this->authorize('view', $student);

        $student->load('classe');

        return $this->successResponse([
            'student' => new StudentResource($student),
        ], 'Étudiant récupéré avec succès.', 200);
    }

    public function update(UpdateStudentRequest $request, Student $student): JsonResponse {

        $this->authorize('update', $student);

        $credentials = $request->validated();

        $student = $this->studentRepository->update($student, $credentials);

        return $this->successResponse([
            'student' => new StudentResource($student),
        ], 'Étudiant mis à jour avec succès.', 200);
    }

    public function destroy(Student $student): JsonResponse {

        $this->authorize('delete', $student);

        $this->studentRepository->delete($student);

        return $this->successResponse([], 'Étudiant supprimé avec succès.', 200);
    }
}
