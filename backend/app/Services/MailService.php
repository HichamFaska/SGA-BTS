<?php

namespace App\Services;

use App\Mail\InvitationMail;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

class MailService {
    
    public function sendInvitation(User $user, Invitation $invitation): void {
        Mail::to($user->email)->send(new InvitationMail($user, $invitation));
    }
}
