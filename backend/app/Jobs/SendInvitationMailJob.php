<?php

namespace App\Jobs;

use App\Mail\InvitationMail;
use App\Models\Invitation;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendInvitationMailJob implements ShouldQueue {

    use Queueable;

    public int $tries = 3;

    public function __construct(
        public readonly int $invitationId,
    ) {}

    public function handle(): void {
        $invitation = Invitation::with('user')->findOrFail($this->invitationId);

        Mail::to($invitation->user->email)->send(new InvitationMail($invitation->user, $invitation));
    }
}
