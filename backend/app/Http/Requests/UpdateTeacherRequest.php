<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeacherRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        $teacherId = $this->route('teacher')?->id;

        return [
            'matricule' => ['sometimes', 'string', 'max:50', Rule::unique('teachers', 'matricule')->ignore($teacherId)],
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'avatar' => ['sometimes', 'nullable', 'string', 'max:255'],
        ];
    }
}
