<?php

namespace App\Http\Middleware;

use App\Exceptions\DeviceAccessException;
use App\Services\Auth\DeviceAccessService;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAuthorizedDeviceSession
{
    public function __construct(private DeviceAccessService $deviceAccess) {}

    /**
     * @param  Closure(Request): Response  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        try {
            $this->deviceAccess->validateAuthenticatedRequest($request, $user);
        } catch (DeviceAccessException $exception) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return $this->unauthorizedResponse($request, $exception);
        }

        return $next($request);
    }

    private function unauthorizedResponse(Request $request, DeviceAccessException $exception): JsonResponse|RedirectResponse
    {
        if ($request->expectsJson() && ! $request->header('X-Inertia')) {
            return response()->json([
                'code' => $exception->errorCode,
                'message' => $exception->getMessage(),
            ], $exception->status);
        }

        return to_route('login')->withErrors([
            'device' => $exception->getMessage(),
            'device_code' => $exception->errorCode,
        ]);
    }
}
