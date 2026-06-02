<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource {

    public function toArray($request): array {
        return [
            'id' => $this->id,
            'matricule' => $this->matricule,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'birth_date' => $this->birth_date?->toDateString(),
            'phone' => $this->phone,
            'address' => $this->address,
            'class_id' => $this->class_id,
            'classe' => $this->whenLoaded('classe', function () {
                return [
                    'id' => $this->classe->id,
                    'name' => $this->classe->name,
                    'level' => $this->classe->level?->value,
                ];
            }),
        ];
    }
}