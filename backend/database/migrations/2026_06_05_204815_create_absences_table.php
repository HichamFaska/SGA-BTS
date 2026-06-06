<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void {
        Schema::create('absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('session_id')->constrained('sessions')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->unsignedInteger('duration')->default(0); // en minutes
            $table->foreignId('recorded_by')->constrained('users')->cascadeOnDelete();
            $table->enum('status', ['non justifiée', 'justifiée'])->default('non justifiée');
            $table->timestamps();

            $table->unique(['session_id', 'student_id']); // une seule absence par étudiant par session
            $table->index(['student_id', 'status']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('absences');
    }
};