@php
    $hours = intdiv($absence->duration, 60);
    $minutes = $absence->duration % 60;
    $duration = $hours > 0 && $minutes > 0
        ? "{$hours}h{$minutes}min"
        : ($hours > 0 ? "{$hours}h" : "{$minutes}min");
@endphp

@component('mail::message')

# Bonjour {{ $student->first_name }} {{ $student->last_name }},

Nous vous informons qu'une **absence** a été enregistrée à votre nom.

---

@component('mail::panel')
**Détails de la séance**

| | |
|---|---|
| **Classe** | {{ $absence->session->classe->name }} |
| **Date** | {{ $absence->session->session_date->translatedFormat('l d F Y') }} |
| **Créneau** | {{ substr($absence->session->start_time, 0, 5) }} → {{ substr($absence->session->end_time, 0, 5) }} |
| **Durée d'absence** | {{ $duration }} |
@endcomponent

Si cette absence est justifiée, nous vous invitons à fournir un **justificatif** à votre établissement dans les plus brefs délais afin de régulariser votre situation.

> En l'absence de justificatif, cette absence restera enregistrée comme **non justifiée**.

Merci de votre compréhension.

Cordialement,

**L'équipe d'administration**

@slot('footer')
Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.
@endslot

@endcomponent
