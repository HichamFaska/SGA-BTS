<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model {

    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'message',
        'is_read',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];


    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }

    public function markAsRead(): void {
        $this->update([
            'is_read' => true,
            'read_at' => now(),
        ]);
    }

    public static function send(User $user, string $title, string $message): static {
        return static::create([
            'user_id' => $user->id,
            'title'   => $title,
            'message' => $message,
        ]);
    }
}