<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TeacherClasseResource extends JsonResource {

    public function toArray($request): array {
        return [
            'id' => $this->id,
            'teacher' => $this->whenLoaded('teacher', fn () => [
                'id' => $this->teacher->id,
                'matricule' => $this->teacher->matricule,
                'first_name' => $this->teacher->user->first_name,
                'last_name' => $this->teacher->user->last_name,
                'subject' => $this->teacher->subject?->name,
            ]),
            'classe' => $this->whenLoaded('classe', fn () => [
                'id' => $this->classe->id,
                'name' => $this->classe->name,
            ]),
            'academic_year' => $this->whenLoaded('academicYear', fn () => [
                'id' => $this->academicYear->id,
                'name' => $this->academicYear->name,
                'is_current' => $this->academicYear->is_current,
            ]),
        ];
    }
}
