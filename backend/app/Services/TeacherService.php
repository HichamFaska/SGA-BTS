<?php

namespace App\Services;

use App\Enums\UserRoleEnum;
use App\Enums\UserStatusEnum;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Support\Str;

class TeacherService {

    public function __construct(private UserRepository $userRepository) {}

    public function createTeacher(array $data): User {

        $user = $this->userRepository->create([
            'first_name' => $data['first_name'],
            'last_name'  => $data['last_name'],
            'email' => $data['email'],
            'password' => Str::random(32),
            'role' => UserRoleEnum::Teacher->value,
            'status' => UserStatusEnum::Active->value,
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'avatar' => $data['avatar'] ?? null,
        ]);

        $user->teacher()->create([
            'matricule'  => $data['matricule'],
            'birth_date' => $data['birth_date'] ?? null,
        ]);

        return $user->load('teacher');
    }

    public function setPassword(User $user, string $password): User {
        $this->userRepository->updatePassword($user, $password);
        $user->email_verified_at = now();
        $user->save();

        return $user;
    }
}
