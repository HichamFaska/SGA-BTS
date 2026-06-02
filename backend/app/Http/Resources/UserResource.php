<?php

namespace App\Http\Resources;

use App\Services\PermissionService;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource {
    public function toArray($request): array {

        $permissions = app(PermissionService::class)->build($this->resource);

        return [
            'id' => $this->id,
            'email' => $this->email,
            'role' => $this->role?->value,

            'permissions' => $permissions,

            'teacher' => $this->whenLoaded('teacher', fn () => [
                'id' => $this->teacher->id,
                'matricule' => $this->teacher->matricule,
                'first_name' => $this->teacher->first_name,
                'last_name' => $this->teacher->last_name,
                'birth_date' => $this->teacher->birth_date?->toDateString(),
                'phone' => $this->teacher->phone,
                'address' => $this->teacher->address,
                'avatar' => $this->teacher->avatar,
            ]),
        ];
    }
}
