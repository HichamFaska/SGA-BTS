<?php

namespace App\Providers;

use App\Models\Invitation;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\User;
use App\Models\Student;
use App\Policies\InvitationPolicy;
use App\Policies\SubjectPolicy;
use App\Policies\TeacherPolicy;
use App\Policies\UserPolicy;
use App\Policies\StudentPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider {

    public function register(): void{
        //
    }

    public function boot(): void {
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(Teacher::class, TeacherPolicy::class);
        Gate::policy(Student::class, StudentPolicy::class);
        Gate::policy(Invitation::class, InvitationPolicy::class);
        Gate::policy(Subject::class, SubjectPolicy::class);
    }
}
