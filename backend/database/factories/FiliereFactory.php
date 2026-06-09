<?php

namespace Database\Factories;

use App\Models\Filiere;
use Illuminate\Database\Eloquent\Factories\Factory;

class FiliereFactory extends Factory {

    protected $model = Filiere::class;

    public function definition(): array {
        $name = fake()->unique()->randomElement([
            'Développement Informatique',
            'Réseaux et Systèmes Informatiques',
            'Comptabilité et Gestion',
            'Commerce International',
            'Marketing et Action Commerciale',
            'Électrotechnique',
            'Maintenance Industrielle',
            'Tourisme et Hôtellerie',
            'Gestion Hôtelière',
            'Analyses Biologiques',
            'Développement Web Full Stack',
            'Petites et Moyennes Entreprises',
            'Génie Énergétique',
        ]);

        $words = explode(' ', $name);
        $code = '';
        foreach ($words as $word) {
            $code .= mb_strtoupper(mb_substr($word, 0, 1));
        }

        return [
            'name' => $name,
            'code' => $code,
        ];
    }
}
