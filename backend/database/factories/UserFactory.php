<?php

namespace Database\Factories;

use App\Enums\UserRoleEnum;
use App\Enums\UserStatusEnum;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class UserFactory extends Factory {

    protected static ?string $password;

    public function definition(): array {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('bts@2026'),
            'role' => UserRoleEnum::Teacher,
            'status' => UserStatusEnum::Active,
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'avatar' => null,
        ];
    }

    public function unverified(): static {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    public function teacher(): static {
        return $this->state(fn (array $attributes) => [
            'role' => UserRoleEnum::Teacher,
        ]);
    }

    public function admin(): static {
        return $this->state(fn (array $attributes) => [
            'role' => UserRoleEnum::Admin,
        ]);
    }

    public function inactive(): static {
        return $this->state(fn (array $attributes) => [
            'status' => UserStatusEnum::Inactive,
        ]);
    }
}
