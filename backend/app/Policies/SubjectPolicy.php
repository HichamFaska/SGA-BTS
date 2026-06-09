<?php

namespace App\Policies;

use App\Models\Subject;
use App\Models\User;

class SubjectPolicy {

    public function viewAny(User $user): bool {
        return $user->isAdmin();
    }

    public function view(User $user, Subject $subject): bool {
        return $user->isAdmin();
    }

    public function create(User $user): bool {
        return $user->isAdmin();
    }

    public function update(User $user, Subject $subject): bool {
        return $user->isAdmin();
    }

    public function delete(User $user, Subject $subject): bool {
        return $user->isAdmin();
    }
}
