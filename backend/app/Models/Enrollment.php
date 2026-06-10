<?php

namespace App\Models;

use App\Enums\EnrollmentStatusEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Enrollment extends Model {

    use HasFactory;

    protected $fillable = [
        'student_id',
        'class_id',
        'academic_year_id',
        'enrollment_date',
        'status',
    ];

    protected $casts = [
        'enrollment_date' => 'date',
        'status' => EnrollmentStatusEnum::class,
    ];

    public function student(): BelongsTo {
        return $this->belongsTo(Student::class);
    }

    public function classe(): BelongsTo {
        return $this->belongsTo(Classe::class, 'class_id');
    }

    public function academicYear(): BelongsTo {
        return $this->belongsTo(AcademicYear::class);
    }

    public function scopeActive(Builder $query): Builder {
        return $query->where('status', EnrollmentStatusEnum::Active->value);
    }

    public function scopeForYear(Builder $query, int $academicYearId): Builder {
        return $query->where('academic_year_id', $academicYearId);
    }
}
