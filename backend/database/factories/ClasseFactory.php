<?php

namespace Database\Factories;

use App\Enums\ClassLevelEnum;
use App\Models\AcademicYear;
use App\Models\Classe;
use App\Models\Filiere;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClasseFactory extends Factory
{
    protected $model = Classe::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement([
                '6ème A', '6ème B', '5ème A', '5ème B',
                '4ème A', '4ème B', '3ème A', '3ème B',
                '2nde A', '2nde B', '1ère A', '1ère B',
                'Tle A', 'Tle B',
            ]),
            'level' => fake()->randomElement(ClassLevelEnum::cases()),
            'academic_year_id' => AcademicYear::factory(),
            'filiere_id' => Filiere::factory(),
        ];
    }
}
