<?php

namespace App\Repositories;

use App\Models\User;

class UserRepository {

    public function create(array $data): User {
        return User::create($data);
    }

    public function findById(int $id): ?User {
        return User::find($id);
    }

    public function findByEmail(string $email): ?User {
        return User::where('email', $email)->first();
    }

    public function updatePassword(User $user, string $password): User {
        $user->update([
            'password' => $password,
        ]);

        return $user;
    }
}
