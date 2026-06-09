@component('mail::message')

# Bonjour {{ $user->first_name }} {{ $user->last_name }}

Un compte a été créé pour vous sur la plateforme. Cliquez sur le bouton ci-dessous pour définir votre mot de passe et accéder à votre espace.

@component('mail::button', ['url' => $url, 'color' => 'primary'])
Activer mon compte
@endcomponent

Ce lien expirera le {{ $invitation->expires_at->translatedFormat('d F Y H:i') }}.

Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet e-mail.

Merci,

L'équipe d'administration

@slot('footer')
Si vous avez des questions, répondez à cet e-mail ou contactez l'administrateur.
@endslot

@endcomponent
