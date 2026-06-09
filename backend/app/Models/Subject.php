<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Subject extends Model {

    use HasFactory;

    protected $fillable = [
        'name',
    ];

    public function teachers(): HasMany {
        return $this->hasMany(Teacher::class);
    }

    public function scopeSearch(Builder $query, ?string $search): Builder {
        if ($search) {
            $query->whereLike('name', "%{$search}%");
        }
        return $query;
    }
}
