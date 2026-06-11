<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TeacherClasse extends Model {

    use HasFactory;

    protected $table = 'teacher_classes';

    protected $fillable = [
        'teacher_id',
        'class_id',
        'academic_year_id',
        'start_date',
        'end_date',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    protected static function booted(): void {
        static::creating(function (TeacherClasse $teacherClasse) {
            if (!$teacherClasse->start_date || !$teacherClasse->end_date) {
                $teacherClasse->loadMissing('academicYear');
                $teacherClasse->start_date ??= $teacherClasse->academicYear->start_date;
                $teacherClasse->end_date ??= $teacherClasse->academicYear->end_date;
            }
        });
    }

    public function teacher(): BelongsTo {
        return $this->belongsTo(Teacher::class);
    }

    public function classe(): BelongsTo {
        return $this->belongsTo(Classe::class, 'class_id');
    }

    public function academicYear(): BelongsTo {
        return $this->belongsTo(AcademicYear::class);
    }
}
