<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Justification extends Model {

    use HasFactory;
    
    protected $fillable = [
        'absence_id',
        'reason',
        'document_url',
    ];

    public function absence(): BelongsTo {
        return $this->belongsTo(Absence::class);
    }
}
