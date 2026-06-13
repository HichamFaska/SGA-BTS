<?php

namespace App\Http\Requests;

use App\Models\Session;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSessionRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        $user = $this->user();

        $classIdRules = $user->isAdmin()
            ? ['required', 'integer', Rule::exists('classes', 'id')]
            : ['required', 'integer', Rule::exists('teacher_classes', 'class_id')->where('teacher_id', $user->teacher->id)];

        $rules = [
            'class_id' => $classIdRules,
            'session_date' => ['required', 'date'],
            'start_time' => ['required', 'date_format:H:i'],
            'end_time' => [
                'required',
                'date_format:H:i',
                'after:start_time',
                function (string $_attribute, mixed $value, \Closure $fail) use ($user) {
                    $teacherId = $user->isAdmin()
                        ? $this->integer('teacher_id')
                        : $user->teacher->id;

                    $sessionDate = $this->input('session_date');
                    $startTime = $this->input('start_time');

                    if ($this->hasOverlap('teacher_id', $teacherId, $sessionDate, $startTime, $value)) {
                        $fail('Ce créneau chevauche une séance existante pour ce professeur.');
                        return;
                    }

                    if ($this->hasOverlap('class_id', $this->input('class_id'), $sessionDate, $startTime, $value)) {
                        $fail('Ce créneau chevauche une séance existante pour cette classe.');
                    }
                },
            ],
            'comment' => ['nullable', 'string', 'max:500'],
        ];

        if ($user->isAdmin()) {
            $rules['teacher_id'] = ['required', 'integer', Rule::exists('teachers', 'id')];
        }

        return $rules;
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
            'teacher_id.required' => 'Le professeur est obligatoire.',
            'teacher_id.exists' => 'Ce professeur est invalide.',
            'class_id.required' => 'La classe est obligatoire.',
            'class_id.exists' => 'Cette classe est invalide ou ne fait pas partie de vos affectations.',
            'session_date.required' => 'La date de la séance est obligatoire.',
            'session_date.date' => 'La date de la séance est invalide.',
            'start_time.required' => "L'heure de début est obligatoire.",
            'start_time.date_format' => "L'heure de début doit être au format HH:MM.",
            'end_time.required' => "L'heure de fin est obligatoire.",
            'end_time.date_format' => "L'heure de fin doit être au format HH:MM.",
            'end_time.after' => "L'heure de fin doit être après l'heure de début.",
            'comment.max' => 'Le commentaire ne doit pas dépasser 500 caractères.',
        ];
    }
}
