<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        $teacherId = $this->route('teacher')?->id;

        return [
            'matricule' => ['sometimes', 'string', 'max:50', Rule::unique('teachers', 'matricule')->ignore($teacherId)],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'subject_id' => ['sometimes', 'nullable', 'integer', 'exists:subjects,id'],
            'first_name' => ['sometimes', 'string', 'max:50'],
            'last_name' => ['sometimes', 'string', 'max:50'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
            'address' => ['sometimes', 'nullable', 'string'],
            'avatar' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array {
        return [
            'matricule.string' => 'Le matricule doit être une chaîne de caractères.',
            'matricule.max' => 'Le matricule ne doit pas dépasser :max caractères.',
            'matricule.unique' => 'Ce matricule est déjà attribué à un enseignant.',
            'birth_date.date' => 'La date de naissance doit être une date valide.',
            'subject_id.integer' => 'La matière doit être un entier.',
            'subject_id.exists' => 'La matière sélectionnée est invalide.',
            'first_name.string' => 'Le prénom doit être une chaîne de caractères.',
            'first_name.max' => 'Le prénom ne doit pas dépasser :max caractères.',
            'last_name.string' => 'Le nom doit être une chaîne de caractères.',
            'last_name.max' => 'Le nom ne doit pas dépasser :max caractères.',
            'phone.string' => 'Le téléphone doit être une chaîne de caractères.',
            'phone.max' => 'Le téléphone ne doit pas dépasser :max caractères.',
            'address.string' => 'L\'adresse doit être une chaîne de caractères.',
            'avatar.string' => 'L\'avatar doit être une chaîne de caractères.',
            'avatar.max' => 'L\'avatar ne doit pas dépasser :max caractères.',
        ];
    }
}
