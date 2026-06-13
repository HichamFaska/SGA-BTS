<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\Storage;
use App\Models\Teacher;

class Absence extends Model {

    use HasFactory;

    protected $fillable = [
        'session_id',
        'student_id',
        'duration',
        'recorded_by',
        'status',
    ];

    protected static function booted(): void {
        static::creating(function (Absence $absence) {
            if (!$absence->duration && $absence->session_id) {
                $absence->loadMissing('session');
                $absence->duration = $absence->session->durationInMinutes();
            }
        });

        static::deleting(function (Absence $absence) {
            $justification = $absence->justification;
            if ($justification?->document_url) {
                Storage::disk('public')->delete($justification->document_url);
            }
        });
    }

    public function session(): BelongsTo {
        return $this->belongsTo(Session::class);
    }

    public function student(): BelongsTo {
        return $this->belongsTo(Student::class);
    }

    public function recordedBy(): BelongsTo {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function justification(): HasOne {
        return $this->hasOne(Justification::class);
    }

    public function scopeUnexcused(Builder $query): Builder {
        return $query->where('status', 'non justifiée');
    }

    public function scopeExcused(Builder $query): Builder {
        return $query->where('status', 'justifiée');
    }

    public function scopeForTeacher(Builder $query, Teacher $teacher): Builder {
        $classIds = $teacher->teacherClasses()->pluck('class_id');
        return $query->whereHas('session', fn ($q) => $q->whereIn('class_id', $classIds));
    }

    public function scopeForStudent(Builder $query, int $studentId): Builder {
        return $query->where('student_id', $studentId);
    }

    public function scopeForClass(Builder $query, int $classId): Builder {
        return $query->whereHas('session', fn ($q) => $q->where('class_id', $classId));
    }

    public function scopeForTeacherSessions(Builder $query, int $teacherId): Builder {
        return $query->whereHas('session', fn ($q) => $q->where('teacher_id', $teacherId));
    }

    public function scopeFromDate(Builder $query, string $date): Builder {
        return $query->whereHas('session', fn ($q) => $q->where('session_date', '>=', $date));
    }

    public function scopeToDate(Builder $query, string $date): Builder {
        return $query->whereHas('session', fn ($q) => $q->where('session_date', '<=', $date));
    }

    public function scopeWithStatus(Builder $query, string $status): Builder {
        return $query->where('status', $status);
    }
}
