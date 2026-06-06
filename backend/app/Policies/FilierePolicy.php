<?php

namespace App\Policies;

use App\Models\Filiere;
use App\Models\User;

class FilierePolicy {

    public function viewAny(User $user): bool {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function view(User $user, Filiere $filiere): bool {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function create(User $user): bool {
        return $user->isAdmin();
    }

    public function update(User $user, Filiere $filiere): bool {
        return $user->isAdmin();
    }

    public function delete(User $user, Filiere $filiere): bool {
        return $user->isAdmin();
    }
}
