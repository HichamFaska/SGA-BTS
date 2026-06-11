<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class TeacherResource extends JsonResource {

    public function toArray($request): array {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'matricule' => $this->matricule,
            'birth_date' => $this->birth_date?->toDateString(),
            'subject_id' => $this->subject_id,
            'subject' => $this->whenLoaded('subject', fn () => $this->subject?->name),
            'user' => $this->whenLoaded('user', fn () => [
                'email' => $this->user->email,
                'status' => $this->user->status?->value,
                'first_name' => $this->user->first_name,
                'last_name' => $this->user->last_name,
                'phone' => $this->user->phone,
                'address' => $this->user->address,
                'avatar' => $this->user->avatar ? Storage::disk('public')->url($this->user->avatar) : null,
                'invitation' => $this->user->relationLoaded('latestInvitation') ? [
                    'accepted_at' => $this->user->latestInvitation?->accepted_at?->toDateTimeString(),
                ] : null,
            ]),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
