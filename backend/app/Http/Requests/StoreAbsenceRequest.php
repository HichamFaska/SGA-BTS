<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAbsenceRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'student_id' => ['required', 'integer', 'exists:students,id'],
            'duration' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array {
        return [
            'student_id.required' => 'L\'étudiant est obligatoire.',
            'student_id.integer' => 'L\'identifiant de l\'étudiant doit être un entier.',
            'student_id.exists' => 'L\'étudiant sélectionné est invalide.',
            'duration.required' => 'La durée est obligatoire.',
            'duration.integer' => 'La durée doit être un entier.',
            'duration.min' => 'La durée doit être d\'au moins 1 minute.',
        ];
    }
}
