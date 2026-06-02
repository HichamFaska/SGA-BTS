<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Student extends Model {

    use HasFactory;

    protected $fillable = [
        'matricule',
        'first_name',
        'last_name',
        'birth_date',
        'phone',
        'address',
        'class_id',
    ];

    protected $casts = [
        'birth_date' => 'date',
    ];

    public function classe(): BelongsTo {
        return $this->belongsTo(Classe::class, 'class_id');
    }
}
