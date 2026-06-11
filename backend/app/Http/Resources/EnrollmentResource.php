<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EnrollmentResource extends JsonResource {

    public function toArray($request): array {
        return [
            'id' => $this->id,
            'enrollment_date' => $this->enrollment_date->format('Y-m-d'),
            'status' => $this->status->value,
            'student' => $this->whenLoaded('student', fn () => [
                'id' => $this->student->id,
                'matricule' => $this->student->matricule,
                'first_name' => $this->student->first_name,
                'last_name' => $this->student->last_name,
                'email' => $this->student->email,
                'phone' => $this->student->phone,
                'birth_date' => $this->student->birth_date?->format('Y-m-d'),
            ]),
            'classe' => $this->whenLoaded('classe', fn() => [
                'id' => $this->classe->id,
                'name' => $this->classe->name,
            ]),
            'academic_year' => $this->whenLoaded('academicYear', fn() => [
                'id' => $this->academicYear->id,
                'name' => $this->academicYear->name,
            ]),
        ];
    }
}
