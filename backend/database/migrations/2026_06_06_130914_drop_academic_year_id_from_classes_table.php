<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {

    public function up(): void {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropIndex(['academic_year_id', 'filiere_id']);
            $table->dropForeign(['academic_year_id']);
            $table->dropColumn('academic_year_id');
            $table->index('filiere_id');
        });
    }

    public function down(): void {
        Schema::table('classes', function (Blueprint $table) {
            $table->dropIndex(['filiere_id']);
            $table->foreignId('academic_year_id')
                ->constrained('academic_years')
                ->cascadeOnDelete();
            $table->index(['academic_year_id', 'filiere_id']);
        });
    }
};
