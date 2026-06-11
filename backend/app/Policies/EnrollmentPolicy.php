<?php

namespace App\Policies;

use App\Models\Enrollment;
use App\Models\User;

class EnrollmentPolicy {

    public function viewAny(User $user): bool {
        return $user->isAdmin();
    }

    public function view(User $user, Enrollment $enrollment): bool {
        return $user->isAdmin();
    }

    public function create(User $user): bool {
        return $user->isAdmin();
    }

    public function bulkCreate(User $user): bool {
        return $user->isAdmin();
    }

    public function update(User $user, Enrollment $enrollment): bool {
        return $user->isAdmin();
    }

    public function delete(User $user, Enrollment $enrollment): bool {
        return $user->isAdmin();
    }
}
