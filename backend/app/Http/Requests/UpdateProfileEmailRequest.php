<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileEmailRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($this->user()->id)],
            'current_password' => ['required', 'string'],
        ];
    }

    public function messages(): array {
        return [
            'email.required' => "L'adresse email est obligatoire.",
            'email.email' => "L'adresse email doit être valide.",
            'email.max' => "L'adresse email ne peut pas dépasser 255 caractères.",
            'email.unique' => "Cette adresse email est déjà utilisée.",
            'current_password.required' => 'Le mot de passe actuel est obligatoire.',
        ];
    }
}
