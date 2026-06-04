<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TeacherResource extends JsonResource {

    public function toArray($request): array {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'matricule' => $this->matricule,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'birth_date' => $this->birth_date?->toDateString(),
            'phone' => $this->phone,
            'address' => $this->address,
            'avatar' => $this->avatar,
            'user' => $this->whenLoaded('user', fn () => [
                'email'  => $this->user->email,
                'status' => $this->user->email_verified_at ? 'active' : 'pending',
            ]),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
