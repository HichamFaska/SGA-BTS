<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherClasseRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'teacher_id' => ['required', 'integer', 'exists:teachers,id'],
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'academic_year_id' => [
                'required', 'integer', 'exists:academic_years,id',
                Rule::unique('teacher_classes')->where(fn($q) =>
                    $q->where('teacher_id', $this->teacher_id)
                      ->where('class_id', $this->class_id)
                )->ignore($this->route('teacherClasse')),
            ],
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
            'academic_year_id.unique' => 'Ce professeur est déjà affecté à cette classe pour cette année.',
        ];
    }
}
