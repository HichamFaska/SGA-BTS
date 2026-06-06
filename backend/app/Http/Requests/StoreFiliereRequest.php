<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFiliereRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'name' => ['required', 'string', 'max:255'],
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('filieres', 'code'),
            ],
        ];
    }

    public function messages(): array {
        return [
            'name.required' => 'Le nom de la filière est obligatoire.',
            'name.string' => 'Le nom doit être une chaîne de caractères.',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',

            'code.required' => 'Le code de la filière est obligatoire.',
            'code.string' => 'Le code doit être une chaîne de caractères.',
            'code.max' => 'Le code ne doit pas dépasser 50 caractères.',
            'code.unique' => 'Ce code est déjà utilisé par une autre filière.',
        ];
    }
}
