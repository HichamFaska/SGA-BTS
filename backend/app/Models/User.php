<?php

namespace App\Models;

use App\Enums\UserRoleEnum;
use App\Enums\UserStatusEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable {

    use HasFactory, Notifiable;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'email_verified_at',
        'status',
        'avatar',
        'phone',
        'address',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'role' => UserRoleEnum::class,
        'status' => UserStatusEnum::class,
    ];

    public function teacher(): HasOne {
        return $this->hasOne(Teacher::class);
    }

    public function invitations(): HasMany {
        return $this->hasMany(Invitation::class);
    }

    public function latestInvitation(): HasOne {
        return $this->hasOne(Invitation::class)->latestOfMany();
    }

    public function sentInvitations(): HasMany {
        return $this->hasMany(Invitation::class, 'invited_by');
    }

    public function notifications(): HasMany {
        return $this->hasMany(Notification::class);
    }

    public function isAdmin(): bool {
        return $this->role === UserRoleEnum::Admin;
    }

    public function isTeacher(): bool {
        return $this->role === UserRoleEnum::Teacher;
    }

    public function isActive(): bool {
        return $this->status === UserStatusEnum::Active;
    }
}
