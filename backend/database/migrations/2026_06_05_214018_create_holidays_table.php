<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('holidays', function (Blueprint $table) {
            $table->id();
            $table->string('titre');
            $table->date('start_date');
            $table->date('end_date');
            $table->timestamps();

            $table->index(['start_date', 'end_date']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('holidays');
    }
};