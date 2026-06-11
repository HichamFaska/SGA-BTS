<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeacherClasseRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'teacher_id' => ['required', 'integer', 'exists:teachers,id'],
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'after_or_equal:start_date'],
        ];
    }

    public function messages(): array {
        return [
            'teacher_id.required' => 'Le professeur est obligatoire.',
            'teacher_id.exists' => "Le professeur sélectionné n'existe pas.",
            'class_id.required' => 'La classe est obligatoire.',
            'class_id.exists' => "La classe sélectionnée n'existe pas.",
            'academic_year_id.required' => "L'année académique est obligatoire.",
            'academic_year_id.exists' => "L'année académique sélectionnée n'existe pas.",
            'end_date.after_or_equal' => "La date de fin doit être égale ou postérieure à la date de début.",
        ];
    }
}
