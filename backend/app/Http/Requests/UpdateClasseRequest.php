<?php

namespace App\Http\Requests;

use App\Enums\ClassLevelEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateClasseRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('classes', 'name')->ignore($this->route('classe')),
            ],
            'level' => [
                'required',
                Rule::enum(ClassLevelEnum::class),
            ],
            'filiere_id' => ['required', 'integer', 'exists:filieres,id'],
        ];
    }

    public function messages(): array {
        return [
            'name.required' => 'Le nom de la classe est obligatoire.',
            'name.unique' => 'Une classe avec ce nom existe déjà.',
            'name.max' => 'Le nom ne doit pas dépasser 255 caractères.',

            'level.required' => 'Le niveau est obligatoire.',
            'level.enum' => 'Le niveau sélectionné est invalide.',

            'filiere_id.required' => 'La filière est obligatoire.',
            'filiere_id.exists' => 'La filière sélectionnée n\'existe pas.',
        ];
    }
}
