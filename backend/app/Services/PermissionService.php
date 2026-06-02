<?php

namespace App\Services;

use App\Models\Invitation;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;

class PermissionService {

    public function build(User $user): array {
        return [
            'teachers' => [
                'viewAny' => $user->can('viewAny', Teacher::class),
                'view' => $user->can('view', Teacher::class),
                'create' => $user->can('create', Teacher::class),
                'update' => $user->can('update', Teacher::class),
                'delete' => $user->can('delete', Teacher::class),
                'resendInvitation' => $user->can('update', Teacher::class),
            ],
            'students' => [
                'viewAny' => $user->can('viewAny', Student::class),
                'view' => $user->can('view', Student::class),
                'create' => $user->can('create', Student::class),
                'update' => $user->can('update', Student::class),
                'delete' => $user->can('delete', Student::class),
            ],
            'invitations' => [
                'create' => $user->can('create', Invitation::class),
            ],
        ];
    }
}
