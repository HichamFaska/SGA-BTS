<?php

namespace App\Policies;

use App\Models\User;

class JustificationPolicy {

    public function manage(User $user): bool {
        return $user->isAdmin();
    }
}
