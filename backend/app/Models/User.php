<?php

namespace App\Models;

use App\Enums\UserRoleEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable {

    use HasFactory, Notifiable;
 
    protected $fillable = [
        'email',
        'password',
        'role',
        'email_verified_at',
    ];
 
    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'role' => UserRoleEnum::class,
    ];

    public function teacher(): HasOne {
        return $this->hasOne(Teacher::class);
    }

    public function invitations(): HasMany {
        return $this->hasMany(Invitation::class);
    }

    public function sentInvitations(): HasMany {
        return $this->hasMany(Invitation::class, 'invited_by');
    }

    public function isAdmin(): bool {
        return $this->role === UserRoleEnum::ADMIN;
    }

    public function isTeacher(): bool {
        return $this->role === UserRoleEnum::TEACHER;
    }
}
