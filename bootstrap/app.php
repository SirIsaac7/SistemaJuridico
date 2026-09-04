<?php

use App\Exceptions\DeviceAccessException;
use App\Http\Middleware\EnsureAuthorizedDeviceSession;
use App\Http\Middleware\EnsureDeviceTokenCookie;
use App\Http\Middleware\EnsureUserIsActive;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
//use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->trustProxies(at: ['127.0.0.1', '::1']);

        $middleware->web(append: [
            EnsureDeviceTokenCookie::class,
            HandleInertiaRequests::class,
            //AddLinkHeadersForPreloadedAssets::class,
            EnsureUserIsActive::class,
            EnsureAuthorizedDeviceSession::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->render(function (DeviceAccessException $exception, Request $request) {
            if ($request->expectsJson() && ! $request->header('X-Inertia')) {
                return response()->json([
                    'code' => $exception->errorCode,
                    'message' => $exception->getMessage(),
                ], $exception->status);
            }

            return false;
        });
    })->create();
