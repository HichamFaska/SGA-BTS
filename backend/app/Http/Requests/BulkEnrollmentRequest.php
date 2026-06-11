<?php

namespace App\Http\Requests;

use App\Enums\EnrollmentStatusEnum;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Validator;

class BulkEnrollmentRequest extends FormRequest {

    public function authorize(): bool {
        return true;
    }

    public function rules(): array {
        return [
            'class_id' => ['required', 'integer', 'exists:classes,id'],
            'academic_year_id' => ['required', 'integer', 'exists:academic_years,id'],
            'student_ids' => ['required', 'array', 'min:1'],
            'student_ids.*' => ['integer', 'exists:students,id'],
        ];
    }

    public function withValidator(Validator $validator): void {
        $validator->after(function ($validate) {
            $studentIds = $this->input('student_ids', []);
            $academicYearId = $this->integer('academic_year_id');
            $classId = $this->integer('class_id');

            $alreadyInClass = DB::table('enrollments')
                ->where('class_id', $classId)
                ->where('academic_year_id', $academicYearId)
                ->whereIn('student_id', $studentIds)
                ->pluck('student_id')
                ->toArray();

            if (!empty($alreadyInClass)) {
                $validate->errors()->add('student_ids', "Certains étudiants sont déjà inscrits dans cette classe pour cette année.");
            }

            $alreadyActive = DB::table('enrollments')
                ->where('academic_year_id', $academicYearId)
                ->where('status', EnrollmentStatusEnum::Active->value)
                ->whereIn('student_id', $studentIds)
                ->pluck('student_id')
                ->toArray();

            if (!empty($alreadyActive)) {
                $validate->errors()->add('student_ids', "Certains étudiants ont déjà une inscription active pour cette année académique.");
            }
        });
    }

    public function messages(): array {
        return [
            'class_id.required' => 'La classe est obligatoire.',
            'class_id.exists' => "La classe sélectionnée n'existe pas.",
            'academic_year_id.required' => "L'année académique est obligatoire.",
            'academic_year_id.exists' => "L'année académique sélectionnée n'existe pas.",
            'student_ids.required' => 'Sélectionnez au moins un étudiant.',
            'student_ids.min' => 'Sélectionnez au moins un étudiant.',
            'student_ids.*.exists' => "Un ou plusieurs étudiants sélectionnés n'existent pas.",
        ];
    }
}
