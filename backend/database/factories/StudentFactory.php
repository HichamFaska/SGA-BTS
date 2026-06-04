<?php

namespace Database\Factories;

use App\Models\Classe;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

class StudentFactory extends Factory
{
    protected $model = Student::class;

    public function definition(): array
    {
        return [
            'matricule' => fake()->unique()->regexify('[A-Z]{3}[0-9]{4}'),
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'birth_date' => fake()->date('Y-m-d', '2008-12-31'),
            'phone' => fake()->unique()->phoneNumber(),
            'address' => fake()->address(),
            'class_id' => Classe::factory(),
        ];
    }
}
