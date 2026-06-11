<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void {
        Schema::create('course_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('teacher_id')->constrained('teachers')->cascadeOnDelete();
            $table->date('session_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->foreignId('created_by')->constrained('users')->cascadeOnDelete();
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(['class_id', 'teacher_id', 'session_date', 'start_time', 'end_time'], 'unique_session');
            $table->index(['class_id', 'session_date']);
            $table->index(['teacher_id', 'session_date']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('course_sessions');
    }
};
