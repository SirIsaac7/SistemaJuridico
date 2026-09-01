<?php

namespace App\Services\Auth;

use App\Exceptions\DeviceAccessException;
use App\Models\DispositivoUsuario;
use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use LogicException;

class DeviceAccessService
{
    public function __construct(
        private DeviceTokenService $tokens,
        private DeviceDescriptorService $descriptor,
    ) {}

    public function establishLogin(Request $request, User $user): DispositivoUsuario
    {
        $this->ensureDatabaseSessionsAreConfigured();

        return DB::transaction(function () use ($request, $user): DispositivoUsuario {
            User::query()->whereKey($user->getKey())->lockForUpdate()->firstOrFail();

            $device = $this->authorizeOrBindDevice($request, $user);
            $this->ensureNoOtherActiveSession($request, $user);

            $device->forceFill(['ultimo_acceso' => now()])->save();

            // Persist the authenticated session before releasing the user lock so a
            // simultaneous login can observe it and cannot create a second session.
            $request->session()->save();

            return $device;
        }, 3);
    }

    public function validateAuthenticatedRequest(Request $request, User $user): DispositivoUsuario
    {
        $this->ensureDatabaseSessionsAreConfigured();

        $tokenHash = $this->tokens->hash($this->tokens->ensureToken($request));
        $activeDevices = $user->dispositivos()->activos()->get();

        if ($activeDevices->isEmpty()) {
            if ($user->dispositivos()->exists()) {
                throw DeviceAccessException::deviceNotAuthorized();
            }

            // Transitional support for sessions that already existed when this
            // feature was deployed. A reset leaves history, so it cannot rebind here.
            return $this->establishLogin($request, $user);
        }

        $device = $activeDevices->first(
            fn (DispositivoUsuario $device): bool => hash_equals($device->device_token_hash, $tokenHash)
        );

        if (! $device) {
            throw DeviceAccessException::deviceNotAuthorized();
        }

        if (! $this->currentSessionQuery($request, $user)->exists()) {
            throw DeviceAccessException::sessionNotAuthorized();
        }

        $touchInterval = (int) config('device_access.last_access_touch_interval_seconds');

        if (! $device->ultimo_acceso || $device->ultimo_acceso->lte(now()->subSeconds($touchInterval))) {
            $device->forceFill(['ultimo_acceso' => now()])->save();
        }

        return $device;
    }

    public function touchCurrentDevice(Request $request, User $user): void
    {
        $tokenHash = $this->tokens->hash($this->tokens->ensureToken($request));

        $user->dispositivos()
            ->activos()
            ->where('device_token_hash', $tokenHash)
            ->update(['ultimo_acceso' => now()]);
    }

    public function resetDevice(User $user): void
    {
        $this->ensureDatabaseSessionsAreConfigured();

        DB::transaction(function () use ($user): void {
            User::query()->whereKey($user->getKey())->lockForUpdate()->firstOrFail();

            $user->dispositivos()
                ->activos()
                ->lockForUpdate()
                ->update(['estado' => DispositivoUsuario::ESTADO_INACTIVO]);

            DB::table($this->sessionTable())
                ->where('user_id', $user->getKey())
                ->delete();
        }, 3);
    }

    private function authorizeOrBindDevice(Request $request, User $user): DispositivoUsuario
    {
        $tokenHash = $this->tokens->hash($this->tokens->ensureToken($request));
        $activeDevices = $user->dispositivos()->activos()->lockForUpdate()->get();
        $matchingDevice = $activeDevices->first(
            fn (DispositivoUsuario $device): bool => hash_equals($device->device_token_hash, $tokenHash)
        );

        if ($matchingDevice) {
            return $matchingDevice;
        }

        $limit = max(1, (int) config('device_access.active_device_limit', 1));

        if ($activeDevices->count() >= $limit) {
            throw DeviceAccessException::deviceNotAuthorized();
        }

        $existingDevice = $user->dispositivos()
            ->where('device_token_hash', $tokenHash)
            ->lockForUpdate()
            ->first();

        if ($existingDevice) {
            $existingDevice->forceFill([
                ...$this->descriptor->detect($request),
                'estado' => DispositivoUsuario::ESTADO_ACTIVO,
                'fecha_vinculacion' => now(),
                'ultimo_acceso' => now(),
            ])->save();

            return $existingDevice;
        }

        return $user->dispositivos()->create([
            'device_token_hash' => $tokenHash,
            ...$this->descriptor->detect($request),
            'estado' => DispositivoUsuario::ESTADO_ACTIVO,
            'fecha_vinculacion' => now(),
            'ultimo_acceso' => now(),
        ]);
    }

    private function ensureNoOtherActiveSession(Request $request, User $user): void
    {
        $hasAnotherSession = $this->activeSessionsQuery($user)
            ->where('id', '!=', $request->session()->getId())
            ->lockForUpdate()
            ->exists();

        if ($hasAnotherSession) {
            throw DeviceAccessException::activeSessionExists();
        }
    }

    private function currentSessionQuery(Request $request, User $user): Builder
    {
        return $this->activeSessionsQuery($user)
            ->where('id', $request->session()->getId());
    }

    private function activeSessionsQuery(User $user): Builder
    {
        return DB::table($this->sessionTable())
            ->where('user_id', $user->getKey())
            ->where('last_activity', '>=', now()->subMinutes((int) config('session.lifetime'))->getTimestamp());
    }

    private function sessionTable(): string
    {
        return (string) config('session.table', 'sessions');
    }

    private function ensureDatabaseSessionsAreConfigured(): void
    {
        if (config('session.driver') !== 'database') {
            throw new LogicException('El control de sesión única requiere SESSION_DRIVER=database.');
        }
    }
}
