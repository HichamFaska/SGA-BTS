<?php

namespace App\Services;

use App\Models\Filiere;
use App\Models\Invitation;
use App\Models\Student;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;

class PermissionService {

    public function build(User $user): array {
        $teacher = $user->teacher;

        return [
            'teachers' => [
                'viewAny' => $user->can('viewAny', Teacher::class),
                'view' => $user->isAdmin() || ($teacher ? $user->can('view', $teacher) : false),
                'create' => $user->can('create', Teacher::class),
                'update' => $user->isAdmin() || ($teacher ? $user->can('update', $teacher) : false),
                'delete' => $user->isAdmin(),
                'resendInvitation' => $user->isAdmin(),
            ],
            'students' => [
                'viewAny' => $user->can('viewAny', Student::class),
                'view' => $user->can('view', new Student()),
                'create' => $user->can('create', Student::class),
                'update' => $user->can('update', new Student()),
                'delete' => $user->can('delete', new Student()),
            ],
            'invitations' => [
                'create' => $user->can('create', Invitation::class),
            ],
            'subjects' => [
                'viewAny' => $user->can('viewAny', Subject::class),
                'view' => $user->can('view', new Subject()),
                'create' => $user->can('create', Subject::class),
                'update' => $user->can('update', new Subject()),
                'delete' => $user->can('delete', new Subject()),
            ],
            'filieres' => [
                'viewAny' => $user->can('viewAny', Filiere::class),
                'view' => $user->can('view', new Filiere()),
                'create' => $user->can('create', Filiere::class),
                'update' => $user->can('update', new Filiere()),
                'delete' => $user->can('delete', new Filiere()),
            ],
        ];
    }
}
