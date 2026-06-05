<?php

namespace App\Http\Middleware;

use App\Enums\UserRoleEnum;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole {

    public function handle(Request $request, Closure $next, string ...$roles): Response {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Non authentifié.'], 401);
        }

        $allowedRoles = [];
        foreach ($roles as $role) {
            $enum = UserRoleEnum::tryFrom($role);
            if($enum) {
                $allowedRoles[] = $enum;
            }
        }

        if (!in_array($user->role, $allowedRoles, true)) {
            return response()->json([
                'message' => 'Accès interdit. Vous n\'avez pas les droits nécessaires.',
            ], 403);
        }

        return $next($request);
    }
}
