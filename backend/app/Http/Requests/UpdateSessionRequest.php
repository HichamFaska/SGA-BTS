<?php

namespace App\Http\Requests;

use App\Models\Session;
use Illuminate\Foundation\Http\FormRequest;

class UpdateSessionRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'session_date' => ['sometimes', 'date'],
            'start_time' => ['sometimes', 'date_format:H:i'],
            'end_time' => [
                'sometimes',
                'date_format:H:i',
                'after:start_time',
                function (string $_attribute, mixed $value, \Closure $fail) {
                    $session = $this->route('session');
                    $sessionDate = $this->input('session_date', $session->session_date->toDateString());
                    $startTime = $this->input('start_time', $session->start_time);

                    if ($this->hasOverlap('teacher_id', $session->teacher_id, $sessionDate, $startTime, $value, $session->id)) {
                        $fail('Ce créneau chevauche une séance existante pour ce professeur.');
                        return;
                    }

                    if ($this->hasOverlap('class_id', $session->class_id, $sessionDate, $startTime, $value, $session->id)) {
                        $fail('Ce créneau chevauche une séance existante pour cette classe.');
                    }
                },
            ],
            'comment' => ['nullable', 'string', 'max:500'],
        ];
    }

    private function hasOverlap(string $column, mixed $value, string $sessionDate, string $startTime, string $endTime, ?int $excludeId = null): bool {
        return Session::where($column, $value)
            ->where('session_date', $sessionDate)
            ->where('start_time', '<', $endTime)
            ->where('end_time', '>', $startTime)
            ->when($excludeId, fn ($query) => $query->where('id', '!=', $excludeId))
            ->exists();
    }

    public function messages(): array {
        return [
            'session_date.date' => 'La date de la séance est invalide.',
            'start_time.date_format' => "L'heure de début doit être au format HH:MM.",
            'end_time.date_format' => "L'heure de fin doit être au format HH:MM.",
            'end_time.after' => "L'heure de fin doit être après l'heure de début.",
            'comment.max' => 'Le commentaire ne doit pas dépasser 500 caractères.',
        ];
    }
}
