<?php

return [
    'threshold_minutes' => env('ABSENCE_THRESHOLD_MINUTES', 480),
    'consecutive_sessions_alert' => env('ABSENCE_CONSECUTIVE_SESSIONS', 4),
];
