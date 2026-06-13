<?php

namespace App\Http\Resources;

use App\Http\Resources\AbsenceResource;
use Illuminate\Http\Resources\Json\JsonResource;

class SessionResource extends JsonResource {

    public function toArray($request): array {
        return [
            'id' => $this->id,
            'session_date' => $this->session_date->toDateString(),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'comment' => $this->comment,
            'called_at' => $this->called_at,
            'absences_count' => $this->whenCounted('absences'),
            'absences' => $this->whenLoaded('absences', function() {
                return $this->absences->map(function($absence) {
                    return (new AbsenceResource($absence))->resolve();
                });
            }),
            'classe' => $this->whenLoaded('classe', fn () => [
                'id' => $this->classe->id,
                'name' => $this->classe->name,
            ]),
            'teacher' => $this->whenLoaded('teacher', fn () => [
                'id' => $this->teacher->id,
                'first_name' => $this->teacher->user->first_name,
                'last_name' => $this->teacher->user->last_name,
            ]),
        ];
    }
}
