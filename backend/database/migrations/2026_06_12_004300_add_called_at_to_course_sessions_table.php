<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    
    public function up(): void {
        Schema::table('course_sessions', function (Blueprint $table) {
            $table->timestamp('called_at')->nullable()->after('comment');
        });
    }

    public function down(): void {
        Schema::table('course_sessions', function (Blueprint $table) {
            $table->dropColumn('called_at');
        });
    }
};
