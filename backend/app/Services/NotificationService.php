<?php

namespace App\Services;

use App\Models\Absence;
use App\Models\Notification;
use App\Models\Session;
use App\Models\User;

class NotificationService {

    public function notifyAdminsAbsencesRecorded(Session $session, int $count): void {
        $session->loadMissing(['classe', 'teacher.user']);
        $this->sendToAdmins(
            $this->buildTitle(),
            $this->buildMessage($session, $count)
        );
    }

    private function buildTitle(): string {
        return "Appel effectué";
    }

    private function buildMessage(Session $session, int $count): string {
        $teacher = $session->teacher->user->first_name.' '.$session->teacher->user->last_name;
        $className = $session->classe->name;
        $date = $session->session_date->format('d/m/Y');
        $start = substr($session->start_time, 0, 5);
        $end = substr($session->end_time, 0, 5);
        $absences = $count.' absence'.($count > 1 ? 's' : '');

        return "Le/La professeur(e) {$teacher} a effectué l'appel de la séance {$className} du {$date} ({$start} → {$end}). {$absences} ont été enregistrée(s). Consultez les absences de la séance enregistrée pour plus de détails.";
    }

    public function notifyAdminsAbsenceAdded(Absence $absence): void {
        $absence->loadMissing(['student', 'session.classe', 'recordedBy']);

        if ($absence->recordedBy->isTeacher()) {
            $this->sendToAdmins(
                "Absence ajoutée",
                $this->buildAbsenceAddedMessage($absence)
            );
        }
    }

    private function buildAbsenceAddedMessage(Absence $absence): string {
        $teacher = $absence->recordedBy->first_name.' '.$absence->recordedBy->last_name;
        $student = $absence->student->first_name.' '.$absence->student->last_name;
        $className = $absence->session->classe->name;
        $date = $absence->session->session_date->format('d/m/Y');
        $start = substr($absence->session->start_time, 0, 5);
        $end = substr($absence->session->end_time, 0, 5);

        return "Le/La professeur(e) {$teacher} a ajouté une absence pour l'étudiant(e) {$student} dans la séance {$className} du {$date} ({$start} → {$end}). Consultez les absences de la séance pour plus de détails.";
    }

    private function sendToAdmins(string $title, string $message): void {
        User::where('role', 'admin')->each(fn(User $admin) => Notification::send($admin, $title, $message));
    }
}
