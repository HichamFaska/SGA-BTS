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
            'matricule' => ['sometimes', 'string', 'max:50', Rule::unique('students', 'matricule')->ignore($studentId)],
            'first_name' => ['sometimes', 'string', 'max:50'],
            'last_name' => ['sometimes', 'string', 'max:50'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'email' => ['sometimes', 'nullable', 'email', 'max:100', Rule::unique('students', 'email')->ignore($studentId)->whereNotNull('email')],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'address' => ['sometimes', 'nullable', 'string'],
        ];
    }

    public function messages(): array {
        return [
            'matricule.string' => 'Le matricule doit être une chaîne de caractères.',
            'matricule.max' => 'Le matricule ne doit pas dépasser :max caractères.',
            'matricule.unique' => 'Ce matricule est déjà attribué à un étudiant.',
            'first_name.string' => 'Le prénom doit être une chaîne de caractères.',
            'first_name.max' => 'Le prénom ne doit pas dépasser :max caractères.',
            'last_name.string' => 'Le nom doit être une chaîne de caractères.',
            'last_name.max' => 'Le nom ne doit pas dépasser :max caractères.',
            'birth_date.date' => 'La date de naissance doit être une date valide.',
            'email.email' => 'L\'adresse email doit être valide.',
            'email.max' => 'L\'adresse email ne doit pas dépasser :max caractères.',
            'email.unique' => 'Cette adresse email est déjà utilisée par un autre étudiant.',
            'phone.string' => 'Le téléphone doit être une chaîne de caractères.',
            'phone.max' => 'Le téléphone ne doit pas dépasser :max caractères.',
            'address.string' => 'L\'adresse doit être une chaîne de caractères.',
        ];
    }
}
