<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;
use App\Services\AuthService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller {

    use ApiResponse;

    public function __construct(
        private readonly AuthService $authService,
    ) {}

    public function login(LoginRequest $request): JsonResponse {

        $user = $this->authService->login(
            $request->validated(),
            $request
        );

        return $this->successResponse([
            'user' => new UserResource($user->load('teacher')),
        ], 'Connexion réussie.', 200);
    }

    public function logout(Request $request): JsonResponse {
        $this->authService->logout($request);

        return $this->successResponse([], 'Déconnexion réussie.', 200);
    }

    public function me(Request $request): JsonResponse {
        $user = $request->user();

        if (!$user) {
            return $this->errorResponse('Utilisateur non authentifié.', 401);
        }

        return $this->successResponse([
            'user' => new UserResource($user->load('teacher')),
        ], 'Utilisateur authentifié.', 200);
    }
}
