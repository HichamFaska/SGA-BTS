<?php

namespace App\Services;

use App\Models\Invitation;
use App\Models\User;
use App\Repositories\InvitationRepository;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

class InvitationService {

    private InvitationRepository $invitationRepository;
    private MailService $mailService;

    public function __construct(
        InvitationRepository $invitationRepository,
        MailService $mailService
    ) {
        $this->invitationRepository = $invitationRepository;
        $this->mailService = $mailService;
    }

    public function send(User $user, int $invitedBy, Carbon $expiresAt): Invitation {
        
        $this->invitationRepository->deletePendingFor($user->id);
        
        $invitation = $this->invitationRepository->create([
            'user_id' => $user->id,
            'invited_by' => $invitedBy,
            'token' => Str::random(64),
            'expires_at' => $expiresAt,
        ]);

        $this->mailService->sendInvitation($user, $invitation);

        return $invitation;
    }

    public function findValidToken(string $token): ?Invitation {
        return $this->invitationRepository->findValidToken($token);
    }

    public function markAccepted(Invitation $invitation): Invitation {
        $invitation->update([
            'accepted_at' => Carbon::now(),
        ]);

        return $invitation;
    }
}