<?php

namespace App\Models;

use App\Enums\ClassLevelEnum;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classe extends Model {
    
    use HasFactory;

    protected $fillable = [
        'name',
        'level',
        'academic_year_id',
        'filiere_id',
    ];

    protected $casts = [
        'level' => ClassLevelEnum::class,
    ];

    public function academicYear(): BelongsTo {
        return $this->belongsTo(AcademicYear::class);
    }

    public function filiere(): BelongsTo {
        return $this->belongsTo(Filiere::class);
    }

    public function students(): HasMany {
        return $this->hasMany(Student::class);
    }
}
