<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Student extends Model {

    use HasFactory, SoftDeletes;

    protected $fillable = [
        'matricule',
        'first_name',
        'last_name',
        'birth_date',
        'email',
        'phone',
        'address',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function enrollments(): HasMany {
        return $this->hasMany(Enrollment::class);
    }

    public function absences(): HasMany {
        return $this->hasMany(Absence::class);
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
}
