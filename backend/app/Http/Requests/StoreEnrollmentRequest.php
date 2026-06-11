<?php

namespace App\Http\Requests;

use App\Enums\EnrollmentStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreEnrollmentRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'student_id' => [
                'required', 'integer', 'exists:students,id',
                Rule::unique('enrollments')->where(fn($q) =>
                    $q->where('class_id', $this->class_id)
                        ->where('academic_year_id', $this->academic_year_id)
                ),
            ],
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'enrollment_date' => ['required', 'date'],
            'status' => ['required', Rule::enum(EnrollmentStatusEnum::class)],
        ];
    }

    public function messages(): array {
        return [
            'student_id.required' => "L'étudiant est obligatoire.",
            'student_id.exists' => "L'étudiant sélectionné n'existe pas.",
            'student_id.unique' => "Cet étudiant est déjà inscrit dans cette classe pour cette année.",
            'class_id.required' => 'La classe est obligatoire.',
            'class_id.exists' => "La classe sélectionnée n'existe pas.",
            'academic_year_id.required' => "L'année académique est obligatoire.",
            'academic_year_id.exists' => "L'année académique sélectionnée n'existe pas.",
            'enrollment_date.required' => "La date d'inscription est obligatoire.",
            'enrollment_date.date' => "La date d'inscription est invalide.",
            'status.required' => 'Le statut est obligatoire.',
        ];
    }

    public function withValidator(Validator $validator): void {
        $validator->after(function ($v) {
            if ($this->status === EnrollmentStatusEnum::Active->value) {
                $exists = DB::table('enrollments')
                    ->where('student_id', $this->student_id)
                    ->where('academic_year_id', $this->academic_year_id)
                    ->where('status', EnrollmentStatusEnum::Active->value)
                    ->exists();

                if ($exists) {
                    $v->errors()->add('student_id', "Cet étudiant a déjà une inscription active pour cette année académique.");
                }
            }
        });
    }
}
