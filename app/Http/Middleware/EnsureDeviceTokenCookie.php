<?php

namespace App\Http\Middleware;

use App\Services\Auth\DeviceTokenService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureDeviceTokenCookie
{
    public function __construct(private DeviceTokenService $tokens) {}

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $this->tokens->ensureToken($request);

        $response = $next($request);
        $response->headers->set('Accept-CH', 'Sec-CH-UA-Platform, Sec-CH-UA-Platform-Version, Sec-CH-UA-Mobile');

        return $response;
    }
}
