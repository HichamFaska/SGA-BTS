<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileEmailRequest;
use App\Http\Requests\UpdateProfilePasswordRequest;
use App\Http\Requests\VerifyEmailRequest;
use App\Http\Resources\UserResource;
use App\Services\EmailVerificationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller {

    use ApiResponse;

    public function __construct(private EmailVerificationService $emailVerificationService) {}

    public function updateEmail(UpdateProfileEmailRequest $request): JsonResponse {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Le mot de passe actuel est incorrect.', 422, [
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $this->emailVerificationService->send($user, $request->email);

        return $this->successResponse([], 'Un code de vérification a été envoyé à votre nouvel email.');
    }

    public function verifyEmail(VerifyEmailRequest $request): JsonResponse {
        $user = $request->user();

        if (!$this->emailVerificationService->verify($user, $request->code)) {
            return $this->errorResponse('Code invalide ou expiré.', 422, [
                'code' => ['Code invalide ou expiré.'],
            ]);
        }

        return $this->successResponse([
            'user' => new UserResource($user->fresh()->load('teacher')),
        ], 'Adresse email mise à jour avec succès.');
    }

    public function updatePassword(UpdateProfilePasswordRequest $request): JsonResponse {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Le mot de passe actuel est incorrect.', 422, [
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update(['password' => $request->password]);

        return $this->successResponse([], 'Mot de passe mis à jour avec succès.');
    }

}
