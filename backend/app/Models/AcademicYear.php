<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicYear extends Model {

    use HasFactory;

    protected $fillable = [
        'name',
        'start_date',
        'end_date',
        'is_current',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'is_current' => 'boolean',
    ];

    public function enrollments(): HasMany {
        return $this->hasMany(Enrollment::class);
    }

    public function teacherClasses(): HasMany {
        return $this->hasMany(TeacherClasse::class);
    }

    public static function current(): ?static {
        return static::where('is_current', true)->first();
    }
}
