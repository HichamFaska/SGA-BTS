<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Holiday extends Model {
    
    use HasFactory;

    protected $fillable = [
        'titre',
        'start_date',
        'end_date'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    public static function isHoliday(\Carbon\Carbon $date): bool {
        return static::query()
            ->where('start_date', '<=', $date->toDateString())
            ->where('end_date',   '>=', $date->toDateString())
            ->exists();
    }
}