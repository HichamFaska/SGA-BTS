<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubjectRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('subjects', 'name')->ignore($this->route('subject')),
            ],
        ];
    }

    public function messages(): array {
        return [
            'name.required' => 'Le nom de la matière est obligatoire.',
            'name.string' => 'Le nom de la matière doit être une chaîne de caractères.',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',
            'name.unique' => 'Cette matière existe déjà.',
        ];
    }
}
