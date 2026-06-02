<?php

namespace App\Traits;

use Illuminate\Http\JsonResponse;

trait ApiResponse {

    protected function successResponse(array $data = [], string $message = '', int $status = 200): JsonResponse {
        $payload = [
            'success' => true,
            'data' => $data,
        ];

        if ($message !== '') {
            $payload['message'] = $message;
        }

        return response()->json($payload, $status);
    }

    protected function errorResponse(string $message, int $status = 400, array $errors = []): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}
