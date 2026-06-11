<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileAvatarRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];
    }

    public function messages(): array {
        return [
            'avatar.required' => "L'avatar est obligatoire.",
            'avatar.image' => "Le fichier doit être une image.",
            'avatar.mimes' => "L'avatar doit être au format jpeg, png, jpg ou webp.",
            'avatar.max' => "L'avatar ne peut pas dépasser 2 Mo.",
        ];
    }
}
