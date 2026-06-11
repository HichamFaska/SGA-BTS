<?php

namespace App\Services;

use App\Mail\EmailVerificationMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class EmailVerificationService {

    public function __construct(private OtpService $otpService) {}

    public function send(User $user, string $newEmail): void {
        $code = $this->otpService->generate($user->id, 'email_verification', [
            'email' => $newEmail,
        ]);

        Mail::to($newEmail)->send(new EmailVerificationMail($user, $code));
    }

    public function verify(User $user, string $code): bool {
        if (!$this->otpService->verify($user->id, 'email_verification', $code)) {
            return false;
        }

        $data = $this->otpService->get($user->id, 'email_verification');

        $user->update([
            'email' => $data['email'],
            'email_verified_at' => now(),
        ]);

        $this->otpService->delete($user->id, 'email_verification');

        return true;
    }
}
