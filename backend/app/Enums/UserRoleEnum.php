<?php

namespace App\Enums;

enum UserRoleEnum: string {
    case ADMIN = 'admin';
    case TEACHER = 'teacher';
    case STUDENT = 'student';
}
