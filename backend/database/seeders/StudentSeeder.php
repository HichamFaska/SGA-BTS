<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder {
    public function run(): void {
        Student::factory(50)->create();
        $this->command->info('50 students created.');
    }
}
