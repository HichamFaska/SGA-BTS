<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateAbsenceRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'status' => ['sometimes', Rule::in(['justifiée', 'non justifiée'])],
            'duration' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function messages(): array {
        return [
            'status.in' => 'Le statut doit être "justifiée" ou "non justifiée".',
            'duration.integer' => 'La durée doit être un entier.',
            'duration.min' => 'La durée doit être d\'au moins 1 minute.',
        ];
    }
}
