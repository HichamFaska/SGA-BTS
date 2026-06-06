<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class ClasseResource extends JsonResource {

    public function toArray($request): array {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'level' => $this->level?->value,
            'filiere_id' => $this->filiere_id,
            'filiere' => $this->whenLoaded('filiere', fn() => [
                'id' => $this->filiere->id,
                'name' => $this->filiere->name,
                'code' => $this->filiere->code,
            ]),
        ];
    }
}
