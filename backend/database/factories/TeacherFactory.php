<?php

namespace Database\Factories;

use App\Models\Teacher;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class TeacherFactory extends Factory {
    protected $model = Teacher::class;

    public function definition(): array {
        return [
            'user_id' => User::factory()->teacher(),
            'matricule' => fake()->unique()->regexify('[A-Z]{3}[0-9]{4}'),
            'birth_date' => fake()->date('Y-m-d', '1990-12-31'),
            'subject_id' => null,
        ];
    }
}
