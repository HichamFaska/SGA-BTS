<?php

use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->group(function () {

    Route::get('teachers', [TeacherController::class, 'index'])->name('teachers.index');
    Route::post('teachers', [TeacherController::class, 'store'])->name('teachers.store');
    Route::get('teachers/{teacher}', [TeacherController::class, 'show'])->name('teachers.show');
    Route::put('teachers/{teacher}', [TeacherController::class, 'update'])->name('teachers.update');
    Route::delete('teachers/{teacher}', [TeacherController::class, 'destroy'])->name('teachers.destroy');
    Route::post('teachers/{teacher}/resend-invitation', [TeacherController::class, 'resend'])
        ->name('teachers.resend-invitation');

    Route::get('students', [StudentController::class, 'index'])->name('students.index');
    Route::post('students', [StudentController::class, 'store'])->name('students.store');
    Route::get('students/{student}', [StudentController::class, 'show'])->name('students.show');
    Route::put('students/{student}', [StudentController::class, 'update'])->name('students.update');
    Route::delete('students/{student}', [StudentController::class, 'destroy'])->name('students.destroy');
});

Route::get('invitations/{token}', [TeacherController::class, 'showByToken'])->name('invitations.show');
Route::post('invitations/{token}/accept', [TeacherController::class, 'accept'])->name('invitations.accept');
