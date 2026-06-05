<?php

namespace App\Http\Controllers;

use App\Http\Requests\AcceptInvitationRequest;
use App\Http\Requests\CreateInvitationRequest;
use App\Http\Requests\UpdateTeacherRequest;
use App\Http\Resources\TeacherResource;
use App\Http\Resources\UserResource;
use App\Models\Teacher;
use App\Repositories\TeacherRepository;
use App\Services\InvitationService;
use App\Services\TeacherService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class TeacherController extends Controller {

    use ApiResponse;

    private InvitationService $invitationService;
    private TeacherService $teacherService;
    private TeacherRepository $teacherRepository;

    public function __construct(
        InvitationService $invitationService,
        TeacherService $teacherService,
        TeacherRepository $teacherRepository
    ) {
        $this->invitationService = $invitationService;
        $this->teacherService = $teacherService;
        $this->teacherRepository = $teacherRepository;
    }

    public function index(Request $request): JsonResponse {
        $this->authorize('viewAny', Teacher::class);

        $teachers = $this->teacherRepository->all(
            search: $request->input('search'),
            status: $request->input('status'),
        );

        return $this->successResponse([
            'teachers' => TeacherResource::collection($teachers),
            'meta' => [
                'current_page' => $teachers->currentPage(),
                'last_page' => $teachers->lastPage(),
                'per_page' => $teachers->perPage(),
                'total' => $teachers->total(),
            ],
        ], 'Liste des enseignants récupérée avec succès.', 200);
    }

    public function store(CreateInvitationRequest $request): JsonResponse {
        $this->authorize('create', Teacher::class);

        $credentials = $request->validated();
        $user = $this->teacherService->createTeacher($credentials);

        $invitation = $this->invitationService->send(
            $user,
            $request->user()->id,
            Carbon::now()->addDays(3),
        );

        return $this->successResponse([
            'user' => new UserResource($user),
            'invitation' => [
                'expires_at' => $invitation->expires_at?->toDateTimeString(),
            ],
        ], 'Invitation envoyée avec succès.', 201);
    }

    public function resend(Request $request, Teacher $teacher): JsonResponse {
        $this->authorize('resendInvitation', $teacher);

        $invitation = $this->invitationService->send(
            $teacher->user,
            $request->user()->id,
            Carbon::now()->addDays(3)
        );

        return $this->successResponse([
            'invitation' => [
                'expires_at' => $invitation->expires_at?->toDateTimeString(),
            ],
        ], 'Invitation renvoyée avec succès.', 200);
    }

    public function show(Teacher $teacher): JsonResponse {
        $this->authorize('view', $teacher);

        $teacher->load('user');

        return $this->successResponse([
            'teacher' => new TeacherResource($teacher),
        ], 'Enseignant récupéré avec succès.', 200);
    }

    public function update(UpdateTeacherRequest $request, Teacher $teacher): JsonResponse {

        $this->authorize('update', $teacher);

        $credentials = $request->validated();
        $teacher = $this->teacherRepository->update($teacher, $credentials);

        return $this->successResponse([
            'teacher' => new TeacherResource($teacher),
        ], 'Enseignant mis à jour avec succès.', 200);
    }

    public function destroy(Teacher $teacher): JsonResponse {
        
        $this->authorize('delete', $teacher);

        $this->teacherRepository->delete($teacher);

        return $this->successResponse([], 'Enseignant supprimé avec succès.', 200);
    }

    public function showByToken(string $token): JsonResponse {
        $invitation = $this->invitationService->findValidToken($token);

        if (!$invitation) {
            return $this->errorResponse('Lien d\'invitation invalide ou expiré.', 404);
        }

        return $this->successResponse([
            'invitation' => [
                'token' => $invitation->token,
                'expires_at' => $invitation->expires_at?->toDateTimeString(),
                'user' => new UserResource($invitation->user),
            ],
        ], 'Invitation valide.', 200);
    }

    public function accept(AcceptInvitationRequest $request, string $token): JsonResponse {
        $invitation = $this->invitationService->findValidToken($token);

        if (!$invitation) {
            return $this->errorResponse('Lien d\'invitation invalide ou expiré.', 404);
        }

        $user = $this->teacherService->setPassword(
            $invitation->user,
            $request->validated()['password']
        );

        $this->invitationService->markAccepted($invitation);

        return $this->successResponse([
            'user' => new UserResource($user),
        ], 'Compte activé avec succès.', 200);
    }
}
