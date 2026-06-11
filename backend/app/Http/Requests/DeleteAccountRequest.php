<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DeleteAccountRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'password' => ['required', 'string'],
        ];
    }

    public function messages(): array {
        return [
            'password.required' => 'Le mot de passe est obligatoire pour confirmer la suppression.',
        ];
    }
}
