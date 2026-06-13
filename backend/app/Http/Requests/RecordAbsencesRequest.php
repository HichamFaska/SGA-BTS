<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RecordAbsencesRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'absences' => ['present', 'array'],
            'absences.*.student_id' => ['required', 'integer', 'exists:students,id'],
            'absences.*.duration' => ['required', 'integer', 'min:1'],
        ];
    }

    public function messages(): array {
        return [
            'absences.present' => 'La liste des absences est obligatoire.',
            'absences.array' => 'La liste des absences doit être un tableau.',
            'absences.*.student_id.required' => 'L\'identifiant de l\'étudiant est obligatoire.',
            'absences.*.student_id.integer' => 'L\'identifiant de l\'étudiant doit être un entier.',
            'absences.*.student_id.exists' => 'Un ou plusieurs étudiants sélectionnés sont invalides.',
            'absences.*.duration.required' => 'La durée est obligatoire pour chaque absence.',
            'absences.*.duration.integer' => 'La durée doit être un entier.',
            'absences.*.duration.min' => 'La durée doit être d\'au moins 1 minute.',
        ];
    }
}
