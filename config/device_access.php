<?php

return [
    'active_device_limit' => (int) env('ACTIVE_DEVICE_LIMIT', 1),

    'cookie' => [
        'name' => env('DEVICE_COOKIE_NAME', 'device_token'),
        'lifetime_minutes' => (int) env('DEVICE_COOKIE_LIFETIME', 60 * 24 * 365 * 5),
        'secure' => env('DEVICE_COOKIE_SECURE'),
        'same_site' => 'lax',
    ],

    'last_access_touch_interval_seconds' => 300,
];
