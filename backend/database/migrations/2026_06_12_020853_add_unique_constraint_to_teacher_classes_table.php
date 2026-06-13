<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void {
        Schema::table('teacher_classes', function (Blueprint $table) {
            $table->unique(['teacher_id', 'class_id', 'academic_year_id'], 'unique_teacher_class_year');
        });
    }

    public function down(): void {
        Schema::table('teacher_classes', function (Blueprint $table) {
            $table->dropUnique('unique_teacher_class_year');
        });
    }
};
