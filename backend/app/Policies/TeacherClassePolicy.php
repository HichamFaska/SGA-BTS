<?php

namespace App\Policies;

use App\Models\TeacherClasse;
use App\Models\User;

class TeacherClassePolicy {

    public function viewAny(User $user): bool {
        return $user->isAdmin();
    }

    public function create(User $user): bool {
        return $user->isAdmin();
    }

    public function update(User $user, TeacherClasse $teacherClasse): bool {
        return $user->isAdmin();
    }

    public function delete(User $user, TeacherClasse $teacherClasse): bool {
        return $user->isAdmin();
    }
}
