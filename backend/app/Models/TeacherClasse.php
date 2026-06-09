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
    ];

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
