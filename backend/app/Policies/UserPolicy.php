<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy {

    public function create(User $user): bool {
        return $user->isAdmin();
    }

    public function delete(User $user, User $model): bool {
        return $user->isAdmin();
    }
}
