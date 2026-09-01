<?php

namespace App\Http\Controllers\Auth;

use App\Exceptions\DeviceAccessException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Services\Auth\DeviceAccessService;
use App\Services\Auth\DeviceResetRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login page.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('auth/login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(
        LoginRequest $request,
        DeviceAccessService $deviceAccess,
        DeviceResetRequestService $resetRequests,
    ): RedirectResponse {
        $request->authenticate();

        $request->session()->regenerate();
        $authenticatedUser = $request->user();

        try {
            $deviceAccess->establishLogin($request, $request->user());
        } catch (Throwable $exception) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            if ($exception instanceof DeviceAccessException
                && $exception->errorCode === DeviceAccessException::DEVICE_NOT_AUTHORIZED
                && $authenticatedUser) {
                $resetRequests->stageChallenge($request, $authenticatedUser);
            }

            if (! $exception instanceof DeviceAccessException) {
                throw $exception;
            }

            if ($request->expectsJson() && ! $request->header('X-Inertia')) {
                throw $exception;
            }

            throw ValidationException::withMessages([
                'device' => $exception->getMessage(),
                'device_code' => $exception->errorCode,
            ]);
        }

        return redirect()->intended(route('dashboard', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request, DeviceAccessService $deviceAccess): RedirectResponse
    {
        $user = $request->user();

        if ($user) {
            $deviceAccess->touchCurrentDevice($request, $user);
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
