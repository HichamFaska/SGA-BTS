<?php

use App\Http\Controllers\AcademicYearController;
use App\Http\Controllers\EnrollmentController;
use App\Http\Controllers\TeacherClasseController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClasseController;
use App\Http\Controllers\FiliereController;
use App\Http\Controllers\StudentImportController;
use App\Http\Controllers\SubjectController;
use App\Http\Controllers\TeacherImportController;
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

    Route::prefix('classes')
        ->name('classes.')
        ->group(function () {

            Route::middleware('role:admin,teacher')->group(function () {
                Route::get('/', [ClasseController::class, 'index'])->name('index');
                Route::get('/list', [ClasseController::class, 'list'])->name('list');
                Route::get('/{classe}', [ClasseController::class, 'show'])->name('show');
            });

            Route::middleware('role:admin')->group(function () {
                Route::post('/', [ClasseController::class, 'store'])->name('store');
                Route::put('/{classe}', [ClasseController::class, 'update'])->name('update');
                Route::delete('/{classe}', [ClasseController::class, 'destroy'])->name('destroy');
            });
        });

    Route::middleware('role:admin')->group(function () {
        Route::prefix('import/students')->name('import.students.')->group(function () {
            Route::post('/preview', [StudentImportController::class, 'preview'])->name('preview');
            Route::post('/', [StudentImportController::class, 'import'])->name('import');
        });

        Route::prefix('import/teachers')->name('import.teachers.')->group(function () {
            Route::post('/preview', [TeacherImportController::class, 'preview'])->name('preview');
            Route::post('/', [TeacherImportController::class, 'import'])->name('import');
        });
    });

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

    Route::prefix('subjects')
        ->name('subjects.')
        ->group(function () {

            Route::middleware('role:admin')->group(function () {
                Route::get('/', [SubjectController::class, 'index'])->name('index');
                Route::get('/list', [SubjectController::class, 'list'])->name('list');
                Route::get('/{subject}', [SubjectController::class, 'show'])->name('show');
                Route::post('/', [SubjectController::class, 'store'])->name('store');
                Route::put('/{subject}', [SubjectController::class, 'update'])->name('update');
                Route::delete('/{subject}', [SubjectController::class, 'destroy'])->name('destroy');
            });
        });

    Route::prefix('academic-years')
        ->name('academic-years.')
        ->group(function () {
            Route::middleware('role:admin,teacher')->group(function () {
                Route::get('/', [AcademicYearController::class, 'index'])->name('index');
                Route::get('/list', [AcademicYearController::class, 'list'])->name('list');
                Route::get('/{academic_year}', [AcademicYearController::class, 'show'])->name('show');
            });
            Route::middleware('role:admin')->group(function () {
                Route::post('/', [AcademicYearController::class, 'store'])->name('store');
                Route::put('/{academic_year}', [AcademicYearController::class, 'update'])->name('update');
                Route::delete('/{academic_year}', [AcademicYearController::class, 'destroy'])->name('destroy');
            });
        });

    Route::prefix('teacher-classes')
        ->name('teacher-classes.')
        ->middleware('role:admin')
        ->group(function () {
            Route::get('/', [TeacherClasseController::class, 'index'])->name('index');
            Route::post('/', [TeacherClasseController::class, 'store'])->name('store');
            Route::put('/{teacherClasse}', [TeacherClasseController::class, 'update'])->name('update');
            Route::delete('/{teacherClasse}', [TeacherClasseController::class, 'destroy'])->name('destroy');
        });

    Route::prefix('enrollments')
        ->name('enrollments.')
        ->middleware('role:admin')
        ->group(function () {
            Route::get('/', [EnrollmentController::class, 'index'])->name('index');
            Route::post('/', [EnrollmentController::class, 'store'])->name('store');
            Route::get('/available-students', [EnrollmentController::class, 'availableStudents'])->name('available-students');
            Route::post('/bulk', [EnrollmentController::class, 'bulkStore'])->name('bulk');
            Route::get('/{enrollment}', [EnrollmentController::class, 'show'])->name('show');
            Route::put('/{enrollment}', [EnrollmentController::class, 'update'])->name('update');
            Route::delete('/{enrollment}', [EnrollmentController::class, 'destroy'])->name('destroy');
        });

    Route::prefix('filieres')
        ->name('filieres.')
        ->group(function () {

            Route::middleware('role:admin,teacher')->group(function () {
                Route::get('/', [FiliereController::class, 'index'])->name('index');
                Route::get('/list', [FiliereController::class, 'list'])->name('list');
                Route::get('/{filiere}', [FiliereController::class, 'show'])->name('show');
            });

            Route::middleware('role:admin')->group(function () {
                Route::post('/', [FiliereController::class, 'store'])->name('store');
                Route::put('/{filiere}', [FiliereController::class, 'update'])->name('update');
                Route::delete('/{filiere}', [FiliereController::class, 'destroy'])->name('destroy');
            });
        });
});

Route::get('invitations/{token}', [TeacherController::class, 'showByToken'])->name('invitations.show');
Route::post('invitations/{token}/accept', [TeacherController::class, 'accept'])->name('invitations.accept');
