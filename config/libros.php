<?php

return [
    'disk' => env('LIBROS_FILESYSTEM_DISK', 'local'),
    'directory' => 'libros',
    'max_upload_size_kb' => 512000,
    'student_preview' => [
        'image_max_width' => 1800,
        'image_max_height' => 1800,
        'image_quality' => 80,
        'allowed_uploads' => [
            'pdf' => [
                'extensions' => ['pdf'],
                'mime_types' => ['application/pdf'],
            ],
            'imagen' => [
                'extensions' => ['gif', 'jpeg', 'jpg', 'png', 'webp'],
                'mime_types' => ['image/gif', 'image/jpeg', 'image/png', 'image/webp'],
            ],
            'video' => [
                'extensions' => ['m4v', 'mov', 'mp4', 'ogv', 'webm'],
                'mime_types' => ['video/mp4', 'video/ogg', 'video/quicktime', 'video/webm', 'video/x-m4v'],
            ],
        ],
    ],
    'prohibited_extensions' => [
        'bat',
        'cmd',
        'com',
        'exe',
        'html',
        'htm',
        'js',
        'mjs',
        'msi',
        'phar',
        'php',
        'phtml',
        'ps1',
        'scr',
        'sh',
        'svg',
    ],
    'prohibited_mime_types' => [
        'application/x-dosexec',
        'application/x-executable',
        'application/x-httpd-php',
        'application/x-msdownload',
        'application/x-sh',
        'text/html',
        'text/javascript',
    ],
];
