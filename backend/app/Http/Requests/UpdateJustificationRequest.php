<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJustificationRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'reason' => ['sometimes', 'string', 'max:1000'],
            'document' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:5120'],
            'remove_document' => ['sometimes', 'boolean'],
        ];
    }

    public function messages(): array {
        return [
            'reason.max' => 'La raison ne doit pas dépasser 1000 caractères.',
            'document.file' => 'Le document doit être un fichier valide.',
            'document.mimes' => 'Le document doit être un PDF, JPG ou PNG.',
            'document.max' => 'Le document ne doit pas dépasser 5 Mo.',
        ];
    }
}
