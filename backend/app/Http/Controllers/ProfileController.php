<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateProfileAvatarRequest;
use App\Http\Requests\UpdateProfileRequest;
use Illuminate\Http\Request;
use App\Http\Resources\UserResource;
use App\Services\UploadService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ProfileController extends Controller {

    use ApiResponse;

    public function __construct(private UploadService $uploadService) {}

    public function update(UpdateProfileRequest $request): JsonResponse {
        $user = $request->user();
        $user->update($request->validated());

        return $this->successResponse([
            'user' => new UserResource($user->load('teacher')),
        ], 'Profil mis à jour avec succès.');
    }

    public function updateAvatar(UpdateProfileAvatarRequest $request): JsonResponse {
        $user = $request->user();

        $avatarUrl = $this->uploadService->replace(
            $request->file('avatar'),
            $user->avatar,
            'avatars'
        );

        $user->update(['avatar' => $avatarUrl]);

        return $this->successResponse([
            'user' => new UserResource($user->load('teacher')),
        ], 'Avatar mis à jour avec succès.');
    }

    public function deleteAvatar(Request $request): JsonResponse {
        $user = $request->user();

        $this->uploadService->delete($user->avatar, 'avatars');
        $user->update(['avatar' => null]);

        return $this->successResponse([
            'user' => new UserResource($user->load('teacher')),
        ], 'Avatar supprimé avec succès.');
    }
}
