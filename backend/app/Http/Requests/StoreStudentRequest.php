<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStudentRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'matricule' => [
                'required',
                'string',
                'max:50',
                Rule::unique('students', 'matricule'),
            ],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birth_date' => ['nullable', 'date'],
            'phone' => ['nullable', 'string', 'max:50'],
            'address' => ['nullable', 'string', 'max:255'],
            'class_id' => ['required', 'integer', 'exists:classes,id'],
        ];
    }

    public function messages(): array {
        return [
            'matricule.required' => 'Le matricule est obligatoire.',
            'matricule.string' => 'Le matricule doit être une chaîne de caractères.',
            'matricule.max' => 'Le matricule ne doit pas dépasser 50 caractères.',
            'matricule.unique' => 'Ce matricule est déjà attribué à un étudiant.',

            'first_name.required' => 'Le prénom est obligatoire.',
            'first_name.string' => 'Le prénom doit être une chaîne de caractères.',
            'first_name.max' => 'Le prénom ne doit pas dépasser 255 caractères.',

            'last_name.required' => 'Le nom est obligatoire.',
            'last_name.string' => 'Le nom doit être une chaîne de caractères.',
            'last_name.max' => 'Le nom ne doit pas dépasser 255 caractères.',

            'birth_date.date' => 'La date de naissance doit être une date valide.',

            'phone.string' => 'Le numéro de téléphone doit être une chaîne de caractères.',
            'phone.max' => 'Le numéro de téléphone ne doit pas dépasser 50 caractères.',

            'address.string' => 'L\'adresse doit être une chaîne de caractères.',
            'address.max' => 'L\'adresse ne doit pas dépasser 255 caractères.',

            'class_id.required' => 'La classe est obligatoire.',
            'class_id.integer' => 'La classe doit être un identifiant valide.',
            'class_id.exists' => 'La classe sélectionnée n\'existe pas.',
        ];
    }
}
