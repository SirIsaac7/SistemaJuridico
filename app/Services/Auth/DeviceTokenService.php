<?php

namespace App\Services\Auth;

use Illuminate\Cookie\CookieJar;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class DeviceTokenService
{
    public function __construct(private CookieJar $cookies) {}

    public function ensureToken(Request $request): string
    {
        $token = $request->cookie($this->cookieName());

        if (! is_string($token) || ! $this->isValid($token)) {
            $token = $this->generate();
            $request->cookies->set($this->cookieName(), $token);
            $this->queueCookie($request, $token);
        }

        return $token;
    }

    public function hash(string $token): string
    {
        return hash_hmac('sha256', $token, (string) config('app.key'));
    }

    public function cookieName(): string
    {
        return (string) config('device_access.cookie.name');
    }

    private function generate(): string
    {
        return Str::of(base64_encode(random_bytes(32)))
            ->replace(['+', '/', '='], ['-', '_', ''])
            ->toString();
    }

    private function isValid(string $token): bool
    {
        return preg_match('/^[A-Za-z0-9_-]{43}$/', $token) === 1;
    }

    private function queueCookie(Request $request, string $token): void
    {
        $secure = config('device_access.cookie.secure');

        $this->cookies->queue($this->cookies->make(
            name: $this->cookieName(),
            value: $token,
            minutes: (int) config('device_access.cookie.lifetime_minutes'),
            path: '/',
            domain: config('session.domain'),
            secure: $secure === null ? $request->isSecure() : (bool) $secure,
            httpOnly: true,
            raw: false,
            sameSite: (string) config('device_access.cookie.same_site'),
        ));
    }
}
