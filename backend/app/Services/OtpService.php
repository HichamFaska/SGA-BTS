<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

class OtpService {

    private const TTL_MINUTES = 10;

    public function generate(int $userId, string $context, array $payload = []): string {
        $code = (string) random_int(100000, 999999);

        Cache::put(
            $this->key($userId, $context),
            array_merge($payload, ['code' => $code]),
            now()->addMinutes(self::TTL_MINUTES)
        );

        return $code;
    }

    public function verify(int $userId, string $context, string $code): bool {
        $data = Cache::get($this->key($userId, $context));
        return $data && $data['code'] === $code;
    }

    public function get(int $userId, string $context): ?array {
        return Cache::get($this->key($userId, $context));
    }

    public function delete(int $userId, string $context): void {
        Cache::forget($this->key($userId, $context));
    }

    private function key(int $userId, string $context): string {
        return "otp:{$context}:{$userId}";
    }
}
