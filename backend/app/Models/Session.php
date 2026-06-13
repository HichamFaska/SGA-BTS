<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

class Session extends Model {

    use HasFactory;

    protected $table = 'course_sessions';

    protected $fillable = [
        'class_id',
        'teacher_id',
        'session_date',
        'start_time',
        'end_time',
        'created_by',
        'comment',
        'called_at',
    ];

    protected $casts = [
        'session_date' => 'date',
        'called_at' => 'datetime',
    ];

    public function classe(): BelongsTo {
        return $this->belongsTo(Classe::class, 'class_id');
    }

    public function teacher(): BelongsTo {
        return $this->belongsTo(Teacher::class);
    }

    public function createdBy(): BelongsTo {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function absences(): HasMany {
        return $this->hasMany(Absence::class);
    }

    public function scopeForDate(Builder $query, string $date): Builder {
        return $query->where('session_date', $date);
    }

    public function scopeForTeacher(Builder $query, int $teacherId): Builder {
        return $query->where('teacher_id', $teacherId);
    }

    public function durationInMinutes(): int {
        return (int) Carbon::parse($this->start_time)
            ->diffInMinutes(Carbon::parse($this->end_time));
    }
}
