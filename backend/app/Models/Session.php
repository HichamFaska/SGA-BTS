<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Carbon;

class Session extends Model {
    
    use HasFactory;

    protected $table = 'course_sessions';

    protected $fillable = [
        'timetable_id',
        'date',
        'status',
        'start_time',
        'end_time',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function timetable(): BelongsTo {
        return $this->belongsTo(Timetable::class);
    }

    public function absences(): HasMany {
        return $this->hasMany(Absence::class);
    }

    public function scopePlanned(Builder $query): Builder {
        return $query->where('status', 'prévue');
    }

    public function scopeCompleted(Builder $query): Builder {
        return $query->where('status', 'réalisée');
    }

    public function scopeCancelled(Builder $query): Builder {
        return $query->where('status', 'annulée');
    }

    public function durationInMinutes(): int {
        return (int) Carbon::parse($this->start_time)
            ->diffInMinutes(Carbon::parse($this->end_time));
    }
}