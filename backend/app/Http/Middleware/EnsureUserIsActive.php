<?php

namespace App\Http\Middleware;

use App\Enums\UserStatusEnum;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive {

    public function handle(Request $request, Closure $next): Response {
        $user = $request->user();

        if ($user && $user->status === UserStatusEnum::Inactive) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return response()->json([
                'message' => 'Votre compte a été désactivé.',
            ], 403);
        }

        return $next($request);
    }
}
