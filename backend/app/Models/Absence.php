<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Absence extends Model {

    use HasFactory;

    protected $fillable = [
        'session_id',
        'student_id',
        'duration',
        'recorded_by',
        'status',
    ];

    protected static function booted(): void {
        static::creating(function (Absence $absence) {
            if (!$absence->duration && $absence->session_id) {
                $absence->loadMissing('session');
                $absence->duration = $absence->session->durationInMinutes();
            }
        });
    }

    public function session(): BelongsTo {
        return $this->belongsTo(Session::class);
    }

    public function student(): BelongsTo {
        return $this->belongsTo(Student::class);
    }

    public function recordedBy(): BelongsTo {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function justification(): HasOne {
        return $this->hasOne(Justification::class);
    }

    public function scopeUnexcused(Builder $query): Builder {
        return $query->where('status', 'non justifiée');
    }

    public function scopeExcused(Builder $query): Builder {
        return $query->where('status', 'justifiée');
    }
}
