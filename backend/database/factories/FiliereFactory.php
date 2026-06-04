<?php

namespace Database\Factories;

use App\Models\Filiere;
use Illuminate\Database\Eloquent\Factories\Factory;

class FiliereFactory extends Factory
{
    protected $model = Filiere::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement([
                'Sciences Mathématiques',
                'Sciences Expérimentales',
                'Sciences Économiques',
                'Lettres et Sciences Humaines',
                'Sciences de la Vie et de la Terre',
                'Sciences Physiques',
                'Sciences de l\'Ingénieur',
            ]),
            'code' => fake()->unique()->regexify('[A-Z]{3,5}'),
        ];
    }
}
