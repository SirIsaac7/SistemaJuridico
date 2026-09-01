<?php

namespace App\Services\Auth;

use App\Models\SolicitudReseteoDispositivo;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class DeviceResetRequestService
{
    private const SESSION_KEY = 'device_reset_request_challenge';

    public function __construct(
        private DeviceTokenService $tokens,
        private DeviceAccessService $deviceAccess,
    ) {}

    public function stageChallenge(Request $request, User $user): void
    {
        $request->session()->put(self::SESSION_KEY, [
            'user_id' => $user->getKey(),
            'device_token_hash' => $this->currentTokenHash($request),
            'expires_at' => now()->addMinutes(
                (int) config('device_access.reset_requests.challenge_lifetime_minutes', 10)
            )->getTimestamp(),
        ]);
    }

    public function createFromChallenge(Request $request): SolicitudReseteoDispositivo
    {
        $challenge = $request->session()->get(self::SESSION_KEY);

        if (! is_array($challenge)
            || ! isset($challenge['user_id'], $challenge['device_token_hash'], $challenge['expires_at'])
            || (int) $challenge['expires_at'] < now()->getTimestamp()
            || ! hash_equals((string) $challenge['device_token_hash'], $this->currentTokenHash($request))) {
            $request->session()->forget(self::SESSION_KEY);

            throw ValidationException::withMessages([
                'device_request' => 'Vuelve a ingresar tus credenciales para solicitar el reseteo del dispositivo.',
            ]);
        }

        $requestModel = DB::transaction(function () use ($challenge): SolicitudReseteoDispositivo {
            $user = User::query()->whereKey($challenge['user_id'])->lockForUpdate()->first();

            if (! $user || ! $user->is_active || $user->trashed()) {
                throw ValidationException::withMessages([
                    'device_request' => 'La cuenta no se encuentra disponible para solicitar el reseteo.',
                ]);
            }

            $currentTokenHash = (string) $challenge['device_token_hash'];
            $activeDevices = $user->dispositivos()->activos()->lockForUpdate()->get();

            if ($activeDevices->isEmpty() || $activeDevices->contains(
                fn ($device): bool => hash_equals($device->device_token_hash, $currentTokenHash)
            )) {
                throw ValidationException::withMessages([
                    'device_request' => 'Tu cuenta ya puede ingresar desde este navegador.',
                ]);
            }

            $latestRequest = $user->solicitudesReseteoDispositivo()
                ->latest('created_at')
                ->lockForUpdate()
                ->first();
            $cooldownDays = (int) config('device_access.reset_requests.cooldown_days', 7);

            if ($latestRequest?->estado === SolicitudReseteoDispositivo::ESTADO_PENDIENTE) {
                throw ValidationException::withMessages([
                    'device_request' => 'Ya tienes una solicitud de reseteo pendiente.',
                ]);
            }

            if ($latestRequest && $latestRequest->created_at->gt(now()->subDays($cooldownDays))) {
                throw ValidationException::withMessages([
                    'device_request' => "Solo puedes enviar una solicitud de reseteo cada {$cooldownDays} días.",
                ]);
            }

            return $user->solicitudesReseteoDispositivo()->create();
        }, 3);

        $request->session()->forget(self::SESSION_KEY);

        return $requestModel;
    }

    public function approve(SolicitudReseteoDispositivo $resetRequest, User $administrator): void
    {
        DB::transaction(function () use ($resetRequest, $administrator): void {
            User::query()->whereKey($resetRequest->usuario_id)->lockForUpdate()->firstOrFail();

            $lockedRequest = SolicitudReseteoDispositivo::query()
                ->whereKey($resetRequest->getKey())
                ->lockForUpdate()
                ->firstOrFail();

            if ($lockedRequest->estado !== SolicitudReseteoDispositivo::ESTADO_PENDIENTE) {
                throw ValidationException::withMessages([
                    'device_request' => 'Esta solicitud ya fue procesada.',
                ]);
            }

            $this->deviceAccess->resetDevice($lockedRequest->usuario);

            $lockedRequest->forceFill([
                'estado' => SolicitudReseteoDispositivo::ESTADO_APROBADA,
                'respondido_por' => $administrator->getKey(),
                'fecha_respuesta' => now(),
            ])->save();
        }, 3);
    }

    private function currentTokenHash(Request $request): string
    {
        return $this->tokens->hash($this->tokens->ensureToken($request));
    }
}
