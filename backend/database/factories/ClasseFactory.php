<?php

namespace Database\Factories;

use App\Enums\ClassLevelEnum;
use App\Models\Classe;
use App\Models\Filiere;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClasseFactory extends Factory {
    protected $model = Classe::class;

    public function definition(): array {
        return [
            'name' => fake()->randomElement([
                'DWFS 2ème année', 'DWFS 1ère année',
                'MI 2ème année', 'MI 1ère année',
                'PME 2ème année', 'PME 1ère année',
                'EN 2ème année', 'EN 1ère année',
            ]),
            'level' => fake()->randomElement(ClassLevelEnum::cases()),
            'filiere_id' => Filiere::factory(),
        ];
    }
}
