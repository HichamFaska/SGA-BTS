<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void {
        Schema::create('course_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('timetable_id')->constrained('timetables')->cascadeOnDelete();
            $table->date('date');
            $table->enum('status', ['prévue', 'réalisée', 'annulée'])->default('prévue');
            $table->time('start_time');
            $table->time('end_time');
            $table->timestamps();

            $table->index(['timetable_id', 'date']);
            $table->index(['date', 'status']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('course_sessions');
    }
};