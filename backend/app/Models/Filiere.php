<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Filiere extends Model {

    use HasFactory;

    protected $fillable = [
        'name',
        'code'
    ];

    public function classes(): HasMany {
        return $this->hasMany(Classe::class);
    }
}
