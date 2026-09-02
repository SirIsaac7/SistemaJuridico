<?php

namespace App\Actions\Fortify;

use App\Exceptions\DeviceAccessException;
use App\Services\Auth\DeviceAccessService;
use App\Services\Auth\DeviceResetRequestService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Throwable;

class EstablishDeviceSession
{
    public function __construct(
        private DeviceAccessService $deviceAccess,
        private DeviceResetRequestService $resetRequests,
    ) {}

    public function handle(Request $request, Closure $next): mixed
    {
        $this->establish($request);

        return $next($request);
    }

    /**
     * @throws ValidationException
     * @throws Throwable
     */
    public function establish(Request $request): void
    {
        $authenticatedUser = $request->user();

        if (! $authenticatedUser) {
            return;
        }

        try {
            $this->deviceAccess->establishLogin($request, $authenticatedUser);
        } catch (Throwable $exception) {
            Auth::guard(config('fortify.guard', 'web'))->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($exception instanceof DeviceAccessException
                && $exception->errorCode === DeviceAccessException::DEVICE_NOT_AUTHORIZED) {
                $this->resetRequests->stageChallenge($request, $authenticatedUser);
            }

            if (! $exception instanceof DeviceAccessException
                || ($request->expectsJson() && ! $request->header('X-Inertia'))) {
                throw $exception;
            }

            throw ValidationException::withMessages([
                'device' => $exception->getMessage(),
                'device_code' => $exception->errorCode,
            ]);
        }
    }
}
