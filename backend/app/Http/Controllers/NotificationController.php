<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller {

    use ApiResponse;

    public function index(Request $request): JsonResponse {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->take(20)
            ->get();

        return $this->successResponse(['notifications' => $notifications]);
    }

    public function unreadCount(Request $request): JsonResponse {
        $count = Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return $this->successResponse(['count' => $count]);
    }

    public function markAllAsRead(Request $request): JsonResponse {
        Notification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return $this->successResponse([], 'Toutes les notifications ont été marquées comme lues.');
    }
}
