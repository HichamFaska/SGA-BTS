<?php

namespace App\Policies;

use App\Models\Session;
use App\Models\User;

class SessionPolicy {

    public function viewAny(User $user): bool {
        return $user->isTeacher() || $user->isAdmin();
    }

    public function view(User $user, Session $session): bool {
        return $user->isAdmin()
            || ($user->isTeacher() && $session->teacher->user_id === $user->id);
    }

    public function create(User $user): bool {
        return $user->isTeacher() || $user->isAdmin();
    }

    public function update(User $user, Session $session): bool {
        return $user->isAdmin()
            || ($user->isTeacher() && $session->teacher->user_id === $user->id);
    }

    public function addAbsence(User $user, Session $session): bool {
        return $session->called_at !== null && (
            $user->isAdmin() || ($user->isTeacher() && $session->teacher->user_id === $user->id)
        );
    }

    public function recordAbsences(User $user, Session $session): bool {
        return $user->isTeacher()
            && $session->teacher->user_id === $user->id
            && $session->called_at === null;
    }

    public function delete(User $user, Session $session): bool {
        $hasNoAbsences = $session->called_at === null;
        return $hasNoAbsences && (
            $user->isAdmin() || ($user->isTeacher() && $session->teacher->user_id === $user->id)
        );
    }
}
