<?php

namespace App\Policies;

use App\Models\Absence;
use App\Models\User;

class AbsencePolicy {

    public function viewAny(User $user): bool {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function update(User $user, Absence $absence): bool {
        return $user->isAdmin()
            || ($user->isTeacher() && $absence->recorded_by === $user->id);
    }

    public function updateStatus(User $user): bool {
        return $user->isAdmin();
    }

    public function delete(User $user, Absence $absence): bool {
        return $user->isAdmin()
            || ($user->isTeacher() && $absence->recorded_by === $user->id);
    }
}
