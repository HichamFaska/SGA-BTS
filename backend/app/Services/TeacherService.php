<?php

namespace App\Services;

use App\Enums\UserRoleEnum;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Str;

class TeacherService {

    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository) {
        $this->userRepository = $userRepository;
    }

    public function createTeacher(array $data): User {
        
        $user = $this->userRepository->create([
            'email' => $data['email'],
            'password' => Str::random(32),
            'role' => UserRoleEnum::TEACHER->value,
        ]);

        
        $user->teacher()->create([
            'matricule' => $data['matricule'],
            'first_name' => $data['first_name'],
            'last_name' => $data['last_name'],
            'birth_date' => $data['birth_date'],
            'phone' => $data['phone'],
            'address' => $data['address'],
        ]);
        
        return $user->load('teacher');
    }

    public function setPassword(User $user, string $password): User {
        $user = $this->userRepository->updatePassword($user, $password);
        $user->email_verified_at = now();
        $user->save();

        return $user;
    }
}
