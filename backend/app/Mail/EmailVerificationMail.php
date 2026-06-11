<?php

namespace App\Mail;

use App\Models\User;
use Illuminate\Mail\Mailable;

class EmailVerificationMail extends Mailable {

    public function __construct(
        public User $user,
        public string $code,
    ) {}

    public function build(): self {
        return $this->subject('Vérification de votre nouvelle adresse email')
            ->markdown('emails.email-verification')
            ->with([
                'user' => $this->user,
                'code' => $this->code,
            ]);
    }
}
