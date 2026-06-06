<?php

namespace App\Policies;

use App\Models\Classe;
use App\Models\User;

class ClassePolicy {

    public function viewAny(User $user): bool {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function view(User $user, Classe $classe): bool {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function create(User $user): bool {
        return $user->isAdmin();
    }

    public function update(User $user, Classe $classe): bool {
        return $user->isAdmin();
    }

    public function delete(User $user, Classe $classe): bool {
        return $user->isAdmin();
    }
}
