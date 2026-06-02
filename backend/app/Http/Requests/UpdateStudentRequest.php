<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateStudentRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        $studentId = $this->route('student')?->id;

        return [
            'matricule' => [
                'sometimes',
                'string',
                'max:50',
                Rule::unique('students', 'matricule')->ignore($studentId),
            ],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'class_id' => ['sometimes', 'integer', 'exists:classes,id'],
        ];
    }

    public function messages(): array {
        return [
            'matricule.string' => 'Le matricule doit être une chaîne de caractères.',
            'matricule.max' => 'Le matricule ne doit pas dépasser 50 caractères.',
            'matricule.unique' => 'Ce matricule est déjà attribué à un étudiant.',

            'first_name.string' => 'Le prénom doit être une chaîne de caractères.',
            'first_name.max' => 'Le prénom ne doit pas dépasser 255 caractères.',

            'last_name.string' => 'Le nom doit être une chaîne de caractères.',
            'last_name.max' => 'Le nom ne doit pas dépasser 255 caractères.',

            'birth_date.date' => 'La date de naissance doit être une date valide.',

            'phone.string' => 'Le numéro de téléphone doit être une chaîne de caractères.',
            'phone.max' => 'Le numéro de téléphone ne doit pas dépasser 50 caractères.',

            'address.string' => 'L\'adresse doit être une chaîne de caractères.',
            'address.max' => 'L\'adresse ne doit pas dépasser 255 caractères.',

            'class_id.integer' => 'La classe doit être un identifiant valide.',
            'class_id.exists' => 'La classe sélectionnée n\'existe pas.',
        ];
    }
}
