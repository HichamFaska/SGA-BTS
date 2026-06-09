<?php

namespace Database\Factories;

use App\Models\AcademicYear;
use Illuminate\Database\Eloquent\Factories\Factory;

class AcademicYearFactory extends Factory {
    protected $model = AcademicYear::class;

    public function definition(): array {
        $year = fake()->numberBetween(2020, 2026);

        return [
            'name' => "{$year}-" . ($year + 1),
            'start_date' => "{$year}-09-01",
            'end_date' => ($year + 1) . "-08-31",
            'is_current' => false,
        ];
    }

    public function current(): static {
        return $this->state(fn (array $attributes) => [
            'is_current' => true,
        ]);
    }
}
