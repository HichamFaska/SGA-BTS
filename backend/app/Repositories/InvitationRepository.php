<?php

namespace App\Repositories;

use App\Models\Invitation;

class InvitationRepository {

    public function create(array $data): Invitation {
        return Invitation::create($data);
    }

    public function findValidToken(string $token): ?Invitation {
        return Invitation::valid()
            ->where('token', $token)
            ->first();
    }
}

