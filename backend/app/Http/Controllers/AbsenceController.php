<?php

namespace App\Http\Controllers;

use App\Http\Requests\RecordAbsencesRequest;
use App\Http\Requests\StoreAbsenceRequest;
use App\Http\Requests\UpdateAbsenceRequest;
use App\Http\Resources\AbsenceResource;
use App\Models\Absence;
use App\Models\Session;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AbsenceController extends Controller {

    use ApiResponse;

    public function index(Request $request): JsonResponse {
        $this->authorize('viewAny', Absence::class);

        $user = $request->user();

        $absences = Absence::with(['student', 'session.classe', 'session.teacher.user', 'justification'])
            ->latest()
            ->when($user->isTeacher(), fn ($q) => $q->forTeacher($user->teacher))
            ->when($request->filled('student_id'), fn ($q) => $q->forStudent($request->integer('student_id')))
            ->when($request->filled('class_id'), fn ($q) => $q->forClass($request->integer('class_id')))
            ->when($request->filled('teacher_id') && $user->isAdmin(), fn ($q) => $q->forTeacherSessions($request->integer('teacher_id')))
            ->when($request->filled('date_from'), fn ($q) => $q->fromDate($request->input('date_from')))
            ->when($request->filled('date_to'), fn ($q) => $q->toDate($request->input('date_to')))
            ->when($request->filled('status'), fn ($q) => $q->withStatus($request->input('status')))
            ->paginate(20);

        return $this->successResponse([
            'absences' => AbsenceResource::collection($absences),
            'meta' => [
                'current_page' => $absences->currentPage(),
                'last_page' => $absences->lastPage(),
                'per_page' => $absences->perPage(),
                'total' => $absences->total(),
            ],
        ], 'Liste des absences récupérée avec succès.');
    }

    public function store(StoreAbsenceRequest $request, Session $session): JsonResponse {
        $this->authorize('addAbsence', $session);

        $alreadyAbsent = $session->absences()->where('student_id', $request->student_id)->exists();
        if ($alreadyAbsent) {
            return $this->errorResponse('Cet étudiant est déjà enregistré comme absent pour cette séance.', 422);
        }

        $absence = Absence::create([
            'session_id' => $session->id,
            'student_id' => $request->student_id,
            'duration' => $request->duration,
            'recorded_by' => $request->user()->id,
        ]);

        $absence->load('student');

        return $this->successResponse([
            'absence' => new AbsenceResource($absence),
        ], 'Absence ajoutée avec succès.', 201);
    }

    public function recordAbsences(RecordAbsencesRequest $request, Session $session): JsonResponse {
        $this->authorize('recordAbsences', $session);

        collect($request->absences)->each(fn ($item) => Absence::create([
            'session_id' => $session->id,
            'student_id' => $item['student_id'],
            'duration' => $item['duration'],
            'recorded_by' => $request->user()->id,
        ]));

        $session->update(['called_at' => now()]);

        $absences = $session->absences()->with('student')->get();

        return $this->successResponse([
            'absences' => AbsenceResource::collection($absences),
        ], 'Appel enregistré avec succès.');
    }

    public function update(UpdateAbsenceRequest $request, Absence $absence): JsonResponse {
        $this->authorize('update', $absence);

        $data = $request->validated();

        if ($request->user()->isTeacher()) {
            unset($data['status']);
        }

        $absence->update($data);

        return $this->successResponse([
            'absence' => new AbsenceResource($absence),
        ], 'Absence mise à jour avec succès.');
    }

    public function destroy(Absence $absence): JsonResponse {
        $this->authorize('delete', $absence);

        $absence->delete();

        return $this->successResponse([], 'Absence supprimée avec succès.');
    }
}
