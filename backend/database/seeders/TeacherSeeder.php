<?php

namespace Database\Seeders;

use App\Models\Teacher;
use Illuminate\Database\Seeder;

class TeacherSeeder extends Seeder {
    public function run(): void {
        Teacher::factory(10)->create();
        $this->command->info('10 teachers created.');
    }
}
