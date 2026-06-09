<?php

namespace App\Http\Middleware;

use App\Enums\UserStatusEnum;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsActive {

    public function handle(Request $request, Closure $next): Response {
        $user = $request->user();

        if ($user && $user->status === UserStatusEnum::Inactive) {
            return response()->json([
                'message' => 'Votre compte a été désactivé.',
            ], 403);
        }

        return $next($request);
    }
}
