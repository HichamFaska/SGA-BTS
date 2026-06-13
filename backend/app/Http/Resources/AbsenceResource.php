<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class AbsenceResource extends JsonResource {

    private function formatDuration(?int $minutes): string {
        if ($minutes === null || $minutes <= 0) {
            return '0min';
        }

        $hours = intdiv($minutes, 60);
        $mins = $minutes % 60;

        return match (true) {
            $hours > 0 && $mins > 0 => "{$hours}h {$mins}min",
            $hours > 0 => "{$hours}h",
            default => "{$mins}min",
        };
    }

    public function toArray($request): array {
        return [
            'id' => $this->id,
            'duration' => $this->formatDuration($this->duration),
            'status' => $this->status,
            'student' => $this->whenLoaded('student', fn () => [
                'id' => $this->student->id,
                'matricule' => $this->student->matricule,
                'first_name' => $this->student->first_name,
                'last_name' => $this->student->last_name,
            ]),
            'session' => $this->whenLoaded('session', fn () => [
                'id' => $this->session->id,
                'session_date' => $this->session->session_date->toDateString(),
                'start_time' => $this->session->start_time,
                'end_time' => $this->session->end_time,
                'classe' => $this->session->relationLoaded('classe') ? [
                    'id' => $this->session->classe->id,
                    'name' => $this->session->classe->name,
                ] : null,
                'teacher' => $this->session->relationLoaded('teacher') ? [
                    'id' => $this->session->teacher->id,
                    'first_name' => $this->session->teacher->user->first_name,
                    'last_name' => $this->session->teacher->user->last_name,
                ] : null,
            ]),
        ];
    }
}
