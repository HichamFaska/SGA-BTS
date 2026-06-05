<?php

namespace App\Policies;

use App\Models\Invitation;
use App\Models\User;
use App\Models\Teacher;

class TeacherPolicy { 

    public function viewAny(User $user): bool {
        return $user->isAdmin();
    }

    public function view(User $user, Teacher $teacher): bool {
        if($user->isAdmin()){
            return true;
        }

        if($teacher && $user->isTeacher()){
            return $teacher->user_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool {
        return $user->isAdmin()
            && $user->can('create', User::class) 
            && $user->can('create', Invitation::class);
    }

    public function update(User $user, Teacher $teacher): bool {
        if($teacher && $user->isTeacher()){
            return $teacher->user_id === $user->id;
        }

        if($user->isAdmin()){
            return true;
        }

        return false;
    }

    public function resendInvitation(User $user, Teacher $teacher): bool {
        return $user->isAdmin();
    }

    public function delete(User $user, Teacher $teacher): bool {
        return $user->isAdmin();
    }
}
