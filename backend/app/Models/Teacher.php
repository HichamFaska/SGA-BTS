<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Teacher extends Model {

    use HasFactory;

    protected $fillable = [
        'user_id',
        'matricule',
        'first_name',
        'last_name',
        'phone',
        'address',
        'birth_date',
        'avatar',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder {
        if ($search) {
            $query->where(function (Builder $q) use ($search) {
                $q->whereLike('first_name', "%{$search}%")
                  ->orWhereLike('last_name', "%{$search}%")
                  ->orWhereLike('matricule', "%{$search}%");
            });
        }
        return $query;
    }

    public function scopeStatus(Builder $query, ?string $status): Builder {
        if ($status === 'active') {
            $query->whereHas('user', fn (Builder $q) => $q->whereNotNull('email_verified_at'));
        } elseif ($status === 'pending') {
            $query->whereHas('user', fn (Builder $q) => $q->whereNull('email_verified_at'));
        }
        return $query;
    }
}
