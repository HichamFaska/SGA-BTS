<?php

namespace App\Models;

use App\Enums\ClassLevelEnum;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Classe extends Model {
    
    use HasFactory;

    protected $fillable = [
        'name',
        'level',
        'filiere_id',
    ];

    protected $casts = [
        'level' => ClassLevelEnum::class,
    ];

    public function filiere(): BelongsTo {
        return $this->belongsTo(Filiere::class);
    }

    public function students(): HasMany {
        return $this->hasMany(Student::class);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder {
        if ($search) {
            $query->whereLike('name', "%{$search}%");
        }
        return $query;
    }

    public function scopeFiliere(Builder $query, ?int $filiereId): Builder {
        if ($filiereId) {
            $query->where('filiere_id', $filiereId);
        }
        return $query;
    }
}
