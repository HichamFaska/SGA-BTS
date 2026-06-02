<?php

use App\Enums\ClassLevelEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('level', array_column(ClassLevelEnum::cases(), 'value'));

            $table->foreignId('academic_year_id')
                ->constrained('academic_years')
                ->cascadeOnDelete();

            $table->foreignId('filiere_id')
                ->constrained('filieres')
                ->cascadeOnDelete();
                
            $table->timestamps();

            $table->index(['academic_year_id', 'filiere_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('classes');
    }
};
