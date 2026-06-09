<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Teacher extends Model {

    use HasFactory, SoftDeletes;

    protected $fillable = [
        'user_id',
        'matricule',
        'birth_date',
        'subject_id',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function subject(): BelongsTo {
        return $this->belongsTo(Subject::class);
    }

    public function teacherClasses(): HasMany {
        return $this->hasMany(TeacherClasse::class);
    }

    public function courseSessions(): HasMany {
        return $this->hasMany(CourseSession::class);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder {
        if ($search) {
            $query->whereHas('user', function (Builder $q) use ($search) {
                $q->whereLike('first_name', "%{$search}%")
                  ->orWhereLike('last_name', "%{$search}%");
            })->orWhereLike('matricule', "%{$search}%");
        }
        return $query;
    }

    public function scopeActive(Builder $query): Builder {
        return $query->whereHas('user', fn (Builder $q) => $q->where('status', 'active'));
    }
}
