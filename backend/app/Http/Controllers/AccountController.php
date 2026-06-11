<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileEmailRequest;
use App\Http\Requests\UpdateProfilePasswordRequest;
use App\Http\Resources\UserResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AccountController extends Controller {

    use ApiResponse;

    public function updateEmail(UpdateProfileEmailRequest $request): JsonResponse {
        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return $this->errorResponse('Le mot de passe actuel est incorrect.', 422, [
                'current_password' => ['Le mot de passe actuel est incorrect.'],
            ]);
        }

        $user->update([
            'email' => $request->email,
            'email_verified_at' => null,
        ]);

        return $this->successResponse([
            'user' => new UserResource($user->load('teacher')),
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
