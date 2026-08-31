<?php

return [
    'disk' => env('LIBROS_FILESYSTEM_DISK', 'local'),
    'directory' => 'libros',
    'max_upload_size_kb' => 512000,
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
