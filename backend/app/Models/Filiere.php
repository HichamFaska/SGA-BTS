<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Filiere extends Model {

    use HasFactory;

    protected $fillable = [
        'name',
        'code',
    ];

    public function classes(): HasMany {
        return $this->hasMany(Classe::class);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder {
        if ($search) {
            $query->where(function(Builder $q) use ($search) {
                $q->whereLike('name', "%{$search}%")
                  ->orWhereLike('code', "%{$search}%");
            });
        }
        return $query;
    }
}
