<?php

namespace App\Policies;

use App\Models\AcademicYear;
use App\Models\User;

class AcademicYearPolicy {

    public function viewAny(User $user): bool {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function view(User $user, AcademicYear $academicYear): bool {
        return $user->isAdmin() || $user->isTeacher();
    }

    public function create(User $user): bool {
        return $user->isAdmin();
    }

    public function update(User $user, AcademicYear $academicYear): bool {
        return $user->isAdmin();
    }

    public function delete(User $user, AcademicYear $academicYear): bool {
        return $user->isAdmin();
    }
}
