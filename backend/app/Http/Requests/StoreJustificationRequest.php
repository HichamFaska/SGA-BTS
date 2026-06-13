<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJustificationRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'reason' => ['required', 'string', 'max:1000'],
            'document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
        ];
    }

    public function messages(): array {
        return [
            'reason.required' => 'La raison est obligatoire.',
            'reason.max' => 'La raison ne doit pas dépasser 1000 caractères.',
            'document.file' => 'Le document doit être un fichier valide.',
            'document.mimes' => 'Le document doit être un PDF, JPG ou PNG.',
            'document.max' => 'Le document ne doit pas dépasser 5 Mo.',
        ];
    }
}
