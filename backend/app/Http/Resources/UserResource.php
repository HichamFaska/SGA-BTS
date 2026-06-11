<?php

namespace App\Http\Resources;

use App\Services\PermissionService;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class UserResource extends JsonResource {

    public function toArray($request): array {

        $permissions = app(PermissionService::class)->build($this->resource);

        return [
            'id' => $this->id,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'role' => $this->role?->value,
            'status' => $this->status?->value,
            'avatar' => $this->avatar ? Storage::disk('public')->url($this->avatar) : null,
            'phone' => $this->phone,
            'address' => $this->address,

            'permissions' => $permissions,

            'teacher' => $this->whenLoaded('teacher', fn () => [
                'id' => $this->teacher->id,
                'matricule' => $this->teacher->matricule,
                'birth_date' => $this->teacher->birth_date?->toDateString(),
                'subject_id' => $this->teacher->subject_id,
            ]),
        ];
    }
}
