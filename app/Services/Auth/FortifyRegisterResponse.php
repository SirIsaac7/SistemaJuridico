<?php

namespace App\Services\Auth;

use App\Actions\Fortify\EstablishDeviceSession;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\RegisterResponse;
use Symfony\Component\HttpFoundation\Response;

class FortifyRegisterResponse implements RegisterResponse
{
    public function __construct(private EstablishDeviceSession $deviceSession) {}

    public function toResponse(mixed $request): Response
    {
        if (! $request instanceof Request) {
            abort(500, 'Fortify registration response requires an HTTP request.');
        }

        $this->deviceSession->establish($request);

        if ($request->wantsJson()) {
            return new JsonResponse('', 201);
        }

        return $request->user()?->hasVerifiedEmail()
            ? redirect()->intended(route('dashboard', absolute: false))
            : to_route('verification.notice');
    }
}
