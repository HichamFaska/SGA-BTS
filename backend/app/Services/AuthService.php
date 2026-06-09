<?php

namespace App\Services;

use App\Enums\UserStatusEnum;
use App\Models\User;
use App\Repositories\UserRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService {

    public function __construct(
        private readonly UserRepository $users,
    ) {}

    public function login(array $credentials, Request $request): User {

        $user = $this->users->findByEmail($credentials['email']);

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Ces identifiants sont incorrects.',
            ]);
        }

        if ($user->status === UserStatusEnum::Inactive) {
            throw ValidationException::withMessages([
                'email' => 'Votre compte a été désactivé.',
            ]);
        }

        Auth::login($user);
        $request->session()->regenerate();

        return $user;
    }

    public function logout(Request $request): void {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
