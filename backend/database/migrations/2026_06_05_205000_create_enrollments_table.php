<?php

use App\Enums\EnrollmentStatusEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->cascadeOnDelete();
            $table->foreignId('class_id')->constrained('classes')->cascadeOnDelete();
            $table->foreignId('academic_year_id')->constrained('academic_years')->cascadeOnDelete();
            $table->date('enrollment_date');
            $table->enum('status', array_column(EnrollmentStatusEnum::cases(), 'value'))->default(EnrollmentStatusEnum::Active->value);
            $table->boolean('is_validated_for_next_year')->default(false);
            $table->timestamps();

            $table->unique(['student_id', 'class_id', 'academic_year_id'], 'unique_enrollment');
            $table->index(['class_id', 'academic_year_id']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('enrollments');
    }
};
