<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreateInvitationRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'matricule' => [
                'required',
                'string',
                'max:50',
                Rule::unique('teachers', 'matricule'),
            ],
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'birth_date' => [
                'nullable',
                'date',
                'before:today',
                'after:1900-01-01',
                'before_or_equal:'.now()->subYears(16)->toDateString(),
            ],
            'phone' => ['nullable', 'string', 'max:50', Rule::unique('users', 'phone')->whereNotNull('phone')],
            'address' => ['nullable', 'string', 'max:255'],
            'avatar' => ['nullable', 'string', 'max:255'],
            'subject_id' => ['nullable', 'integer', 'exists:subjects,id'],
        ];
    }

    public function messages(): array {
        return [
            'email.required' => 'L\'adresse email est obligatoire.',
            'email.email' => 'Veuillez saisir une adresse email valide.',
            'email.max' => 'L\'adresse email ne doit pas dépasser 255 caractères.',
            'email.unique' => 'Cette adresse email est déjà utilisée.',
            
            'matricule.required' => 'Le matricule est obligatoire.',
            'matricule.string' => 'Le matricule doit être une chaîne de caractères.',
            'matricule.max' => 'Le matricule ne doit pas dépasser 50 caractères.',
            'matricule.unique' => 'Ce matricule est déjà attribué à un enseignant.',
            
            'first_name.required' => 'Le prénom est obligatoire.',
            'first_name.string' => 'Le prénom doit être une chaîne de caractères.',
            'first_name.max' => 'Le prénom ne doit pas dépasser 255 caractères.',
            
            'last_name.required' => 'Le nom est obligatoire.',
            'last_name.string' => 'Le nom doit être une chaîne de caractères.',
            'last_name.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            
            'birth_date.date' => 'La date de naissance doit être une date valide.',
            'birth_date.before' => 'La date de naissance ne peut pas être dans le futur.',
            'birth_date.after' => 'La date de naissance doit être postérieure au 1er janvier 1900.',
            'birth_date.before_or_equal' => 'Vous devez avoir au moins 16 ans pour créer un compte.',
            
            'phone.string' => 'Le numéro de téléphone doit être une chaîne de caractères.',
            'phone.max' => 'Le numéro de téléphone ne doit pas dépasser 50 caractères.',
            'phone.unique' => 'Ce numéro de téléphone est déjà utilisé.',
            
            'address.string' => 'L\'adresse doit être une chaîne de caractères.',
            'address.max' => 'L\'adresse ne doit pas dépasser 255 caractères.',
            
            'avatar.string' => 'L\'avatar doit être une chaîne de caractères.',
            'avatar.max' => 'L\'avatar ne doit pas dépasser 255 caractères.',
            'subject_id.integer' => 'La matière doit être un entier.',
            'subject_id.exists' => 'La matière sélectionnée est invalide.',
        ];
    }
}
