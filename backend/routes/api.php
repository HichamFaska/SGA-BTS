<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\TeacherController;
use Illuminate\Support\Facades\Route;

Route::post('login', [AuthController::class, 'login'])
    ->middleware('throttle:10,1')
    ->name('auth.login');

Route::get('me', [AuthController::class, 'me'])->name('auth.me');

Route::middleware('auth:sanctum')->group(function () {

    Route::post('logout', [AuthController::class, 'logout'])->name('auth.logout');

    Route::prefix('teachers')
        ->name('teachers.')
        ->group(function () {

            Route::middleware('role:teacher,admin')->group(function () {
                Route::get('/{teacher}', [TeacherController::class, 'show'])->name('show');
                Route::put('/{teacher}', [TeacherController::class, 'update'])->name('update');
            });

            Route::middleware('role:admin')->group(function () {
                Route::get('/', [TeacherController::class, 'index'])->name('index');
                Route::post('/', [TeacherController::class, 'store'])->name('store');
                Route::delete('/{teacher}', [TeacherController::class, 'destroy'])->name('destroy');
                Route::post('/{teacher}/resend-invitation', [TeacherController::class, 'resend'])
                    ->name('resend-invitation');
            });
        });

    Route::get('classes', [ClasseController::class, 'index'])->name('classes.index');

    Route::prefix('students')
        ->name('students.')
        ->group(function () {

            Route::middleware('role:admin,teacher')->group(function () {
                Route::get('/', [StudentController::class, 'index'])->name('index');
                Route::get('/{student}', [StudentController::class, 'show'])->name('show');
            });

            Route::middleware('role:admin')->group(function () {
                Route::post('/', [StudentController::class, 'store'])->name('store');
                Route::put('/{student}', [StudentController::class, 'update'])->name('update');
                Route::delete('/{student}', [StudentController::class, 'destroy'])->name('destroy');
            });
        });
});

Route::get('invitations/{token}', [TeacherController::class, 'showByToken'])->name('invitations.show');
Route::post('invitations/{token}/accept', [TeacherController::class, 'accept'])->name('invitations.accept');
