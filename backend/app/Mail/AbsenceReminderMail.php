<?php

namespace App\Mail;

use App\Models\Absence;
use Illuminate\Mail\Mailable;

class AbsenceReminderMail extends Mailable {

    public function __construct(public Absence $absence) {}

    public function build(): self {
        $student = $this->absence->student;

        return $this->subject('Absence enregistrée — Justification requise')
            ->markdown('emails.absence-reminder')
            ->with([
                'absence' => $this->absence,
                'student' => $student,
            ]);
    }
}
