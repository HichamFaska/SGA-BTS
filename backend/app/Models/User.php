<?php

namespace App\Models;

use App\Enums\UserRoleEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable {

    use HasFactory, Notifiable;
 
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'avatar',
        'address',
        'phone',
    ];
 
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'role' => UserRoleEnum::class,
    ];

    public function isAdmin(): bool {
        return $this->role === UserRoleEnum::ADMIN->value;
    }

    public function isTeacher(): bool {
        return $this->role === UserRoleEnum::TEACHER->value;
    }

    public function isStudent(): bool {
        return $this->role === UserRoleEnum::STUDENT->value;
    }
}
