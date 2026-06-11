@component('mail::message')

# Bonjour {{ $user->first_name }} {{ $user->last_name }}

Vous avez demandé à modifier votre adresse email. Utilisez le code ci-dessous pour confirmer cette modification.

@component('mail::panel')
# {{ $code }}
@endcomponent

Ce code est valable pendant **10 minutes**.

Si vous n'avez pas effectué cette demande, ignorez cet email. Votre adresse actuelle restera inchangée.

Merci,

L'équipe d'administration

@endcomponent
