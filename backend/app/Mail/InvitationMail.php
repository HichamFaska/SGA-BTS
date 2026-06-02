<?php

namespace App\Mail;

use App\Models\Invitation;
use App\Models\User;
use Illuminate\Mail\Mailable;

class InvitationMail extends Mailable {
    public User $user;
    public Invitation $invitation;
    public string $url;

    public function __construct(User $user, Invitation $invitation) {
        $this->user = $user;
        $this->invitation = $invitation;
        $this->url = config('frontend.url').'/accept-invitation?token='.$invitation->token;
    }

    public function build(): self {
        $this->user->loadMissing('teacher');

        return $this->subject('Invitation à compléter votre compte')
            ->markdown('emails.invitation')
            ->with([
                'user' => $this->user,
                'invitation' => $this->invitation,
                'url' => $this->url,
            ]);
    }
}
