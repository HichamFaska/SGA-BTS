<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Student;

class StudentPolicy {

    public function viewAny(User $user): bool {
        if($user->isAdmin()){
            return true;
        }

        if($user->isTeacher()){
            return true;
        }

        return false;
    }

    public function view(User $user, Student $student): bool {
        if($user->isAdmin()){
            return true;
        }

        if($user->isTeacher()){
            return true;
        }
        
        return false;
    }

    public function create(User $user): bool {
        return $user->isAdmin();
    }

    public function update(User $user, Student $student): bool {
        return $user->isAdmin();
    }

    public function delete(User $user, Student $student): bool {
        return $user->isAdmin();
    }
}
