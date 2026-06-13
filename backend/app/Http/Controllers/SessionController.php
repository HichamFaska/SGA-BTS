<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreSessionRequest;
use App\Http\Requests\UpdateSessionRequest;
use App\Http\Resources\SessionResource;
use App\Http\Resources\StudentResource;
use App\Models\Session;
use App\Models\Student;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller {

    use ApiResponse;

    public function index(Request $request): JsonResponse {
        $this->authorize('viewAny', Session::class);

        $user = $request->user();
        $query = Session::with(['classe', 'teacher.user'])->withCount('absences');

        if ($user->isAdmin()) {
            $date = $request->input('date', today()->toDateString());
            $query->forDate($date);
        } else {
            $query->forTeacher($user->teacher->id)->forDate(today()->toDateString());
        }

        $sessions = $query->orderBy('start_time')->get();

        return $this->successResponse([
            'sessions' => SessionResource::collection($sessions),
        ], 'Liste des séances récupérée avec succès.');
    }

    public function show(Session $session): JsonResponse {
        $this->authorize('view', $session);

        $session->load(['classe', 'teacher.user', 'absences.student']);

        return $this->successResponse([
            'session' => new SessionResource($session),
        ], 'Séance récupérée avec succès.');
    }

    public function store(StoreSessionRequest $request): JsonResponse {
        $this->authorize('create', Session::class);

        $user = $request->user();
        $teacherId = $user->isAdmin() ? $request->integer('teacher_id') : $user->teacher->id;

        $session = Session::create([
            ...$request->validated(),
            'teacher_id' => $teacherId,
            'created_by' => $user->id,
        ]);

        $session->load(['classe', 'teacher.user']);
        $session->loadCount('absences');

        return $this->successResponse([
            'session' => new SessionResource($session),
        ], 'Séance créée avec succès.', 201);
    }

    public function update(UpdateSessionRequest $request, Session $session): JsonResponse {
        $this->authorize('update', $session);

        $session->update($request->validated());
        $session->load(['classe', 'teacher.user']);
        $session->loadCount('absences');

        return $this->successResponse([
            'session' => new SessionResource($session),
        ], 'Séance mise à jour avec succès.');
    }

    public function destroy(Session $session): JsonResponse {
        $this->authorize('delete', $session);

        $session->delete();

        return $this->successResponse([], 'Séance supprimée avec succès.');
    }

    public function students(Session $session): JsonResponse {
        $this->authorize('view', $session);

        $students = Student::inClasse($session->class_id)
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return $this->successResponse([
            'students' => StudentResource::collection($students),
        ], 'Étudiants de la séance récupérés avec succès.');
    }

    public function availableStudents(Session $session): JsonResponse {
        $this->authorize('view', $session);

        $students = Student::inClasse($session->class_id)
            ->whereDoesntHave('absences', fn ($query) => $query->where('session_id', $session->id))
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->get();

        return $this->successResponse([
            'students' => StudentResource::collection($students),
        ], 'Étudiants disponibles récupérés avec succès.');
    }

    public function myClasses(Request $request): JsonResponse {
        $teacher = $request->user()->teacher;

        $classes = $teacher->teacherClasses()
            ->with('classe')
            ->get()
            ->pluck('classe')
            ->unique('id')
            ->values()
            ->map(fn ($classe) => ['id' => $classe->id, 'name' => $classe->name]);

        return $this->successResponse([
            'classes' => $classes,
        ], 'Classes récupérées avec succès.');
    }
}
