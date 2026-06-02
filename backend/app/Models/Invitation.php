<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invitation extends Model {
    
    protected $fillable = [
        'user_id',
        'invited_by',
        'token',
        'expires_at',
        'accepted_at',
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'accepted_at' => 'datetime',
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function invitedBy(): BelongsTo {
        return $this->belongsTo(User::class, 'invited_by');
    }

    public function scopeValid(Builder $query): Builder {
        return $query->whereNull('accepted_at')
            ->where('expires_at', '>', now());
    }
}
