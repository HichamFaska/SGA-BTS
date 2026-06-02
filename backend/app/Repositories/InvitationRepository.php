<?php

namespace App\Repositories;

use App\Models\Invitation;

class InvitationRepository {

    public function create(array $data): Invitation {
        return Invitation::create($data);
    }

    public function findValidToken(string $token): ?Invitation {
        return Invitation::valid()
            ->with(['user', 'user.teacher'])
            ->where('token', $token)
            ->first();
    }

    public function deletePendingFor(int $userId): int {
        return Invitation::where('user_id', $userId)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->delete();
    }
}
