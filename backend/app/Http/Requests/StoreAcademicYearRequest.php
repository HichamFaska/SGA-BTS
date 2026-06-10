<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAcademicYearRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'name' => ['required', 'string', 'max:100', 'unique:academic_years,name'],
            'start_date' => ['required', 'date'],
            'end_date' => ['required', 'date', 'after:start_date'],
            'is_current' => ['boolean'],
        ];
    }

    public function messages(): array {
        return [
            'name.required' => "Le nom de l'année académique est obligatoire.",
            'name.max' => "Le nom ne doit pas dépasser 100 caractères.",
            'name.unique' => "Cette année académique existe déjà.",
            'start_date.required' => 'La date de début est obligatoire.',
            'start_date.date' => 'La date de début est invalide.',
            'end_date.required' => 'La date de fin est obligatoire.',
            'end_date.date' => 'La date de fin est invalide.',
            'end_date.after' => 'La date de fin doit être postérieure à la date de début.',
        ];
    }
}
