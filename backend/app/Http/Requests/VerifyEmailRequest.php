<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VerifyEmailRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'code' => ['required', 'string', 'size:6'],
        ];
    }

    public function messages(): array {
        return [
            'code.required' => 'Le code de vérification est obligatoire.',
            'code.size' => 'Le code de vérification doit contenir exactement 6 caractères.',
        ];
    }
}
