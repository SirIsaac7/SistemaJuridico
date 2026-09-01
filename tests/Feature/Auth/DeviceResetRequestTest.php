<?php

namespace Tests\Feature\Auth;

use App\Models\DispositivoUsuario;
use App\Models\SolicitudReseteoDispositivo;
use App\Models\User;
use App\Services\Auth\DeviceTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Testing\TestResponse;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class DeviceResetRequestTest extends TestCase
{
    use RefreshDatabase;

    private const AUTHORIZED_TOKEN = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

    private const REQUESTING_TOKEN = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';

    public function test_unauthorized_device_can_create_request_after_valid_credentials(): void
    {
        $user = User::factory()->create();
        $this->createActiveDevice($user, self::AUTHORIZED_TOKEN);

        $response = $this->requestReset($user);

        $response->assertRedirect()->assertSessionHas(
            'status',
            'Tu solicitud fue enviada. Un administrador revisará el reseteo de tu dispositivo.',
        );
        $this->assertDatabaseHas('solicitudes_reseteo_dispositivo', [
            'usuario_id' => $user->id,
            'estado' => SolicitudReseteoDispositivo::ESTADO_PENDIENTE,
        ]);
    }

    public function test_request_without_recent_credential_validation_is_rejected(): void
    {
        $response = $this
            ->withCookie(config('device_access.cookie.name'), self::REQUESTING_TOKEN)
            ->post('/device-reset-requests');

        $response->assertRedirect()->assertSessionHasErrors([
            'device_request' => 'Vuelve a ingresar tus credenciales para solicitar el reseteo del dispositivo.',
        ]);
        $this->assertDatabaseCount('solicitudes_reseteo_dispositivo', 0);
    }

    public function test_user_can_only_create_one_request_every_seven_days(): void
    {
        $this->travelTo('2026-09-01 10:00:00');
        $user = User::factory()->create();
        $this->createActiveDevice($user, self::AUTHORIZED_TOKEN);
        $this->requestReset($user)->assertRedirect();
        SolicitudReseteoDispositivo::query()->firstOrFail()->update([
            'estado' => SolicitudReseteoDispositivo::ESTADO_APROBADA,
            'fecha_respuesta' => now(),
        ]);
        $this->travel(6)->days();

        $response = $this->requestReset($user);

        $response->assertRedirect()->assertSessionHasErrors([
            'device_request' => 'Solo puedes enviar una solicitud de reseteo cada 7 días.',
        ]);
        $this->assertDatabaseCount('solicitudes_reseteo_dispositivo', 1);
        $this->travelBack();
    }

    public function test_user_can_create_another_request_after_seven_days(): void
    {
        $this->travelTo('2026-09-01 10:00:00');
        $user = User::factory()->create();
        $this->createActiveDevice($user, self::AUTHORIZED_TOKEN);
        SolicitudReseteoDispositivo::factory()->for($user, 'usuario')->aprobada()->create();
        $this->travel(7)->days();

        $response = $this->requestReset($user);

        $response->assertRedirect()->assertSessionHasNoErrors();
        $this->assertDatabaseCount('solicitudes_reseteo_dispositivo', 2);
        $this->travelBack();
    }

    public function test_user_cannot_create_another_request_while_one_is_pending(): void
    {
        $this->travelTo('2026-09-01 10:00:00');
        $user = User::factory()->create();
        $this->createActiveDevice($user, self::AUTHORIZED_TOKEN);
        SolicitudReseteoDispositivo::factory()->for($user, 'usuario')->create();
        $this->travel(8)->days();

        $response = $this->requestReset($user);

        $response->assertRedirect()->assertSessionHasErrors([
            'device_request' => 'Ya tienes una solicitud de reseteo pendiente.',
        ]);
        $this->assertDatabaseCount('solicitudes_reseteo_dispositivo', 1);
        $this->travelBack();
    }

    public function test_authorized_administrator_can_view_and_approve_request(): void
    {
        $administrator = User::factory()->create();
        $administratorRole = Role::findOrCreate('administrador');
        $administratorRole->givePermissionTo(Permission::findOrCreate('usuarios.resetear-dispositivo'));
        $administrator->assignRole($administratorRole);
        $user = User::factory()->create();
        $device = $this->createActiveDevice($user, self::AUTHORIZED_TOKEN);
        $resetRequest = SolicitudReseteoDispositivo::factory()->for($user, 'usuario')->create();
        $this->createActiveSession($user, 'target-session');

        $this->actingAs($administrator)
            ->withCookie(config('device_access.cookie.name'), self::REQUESTING_TOKEN)
            ->get('/users/device-reset-requests')
            ->assertOk();

        $response = $this->actingAs($administrator)
            ->withCookie(config('device_access.cookie.name'), self::REQUESTING_TOKEN)
            ->post("/users/device-reset-requests/{$resetRequest->id}/approval");

        $response->assertRedirect()->assertSessionHasNoErrors();
        $this->assertDatabaseHas('solicitudes_reseteo_dispositivo', [
            'id' => $resetRequest->id,
            'estado' => SolicitudReseteoDispositivo::ESTADO_APROBADA,
            'respondido_por' => $administrator->id,
        ]);
        $this->assertSame(DispositivoUsuario::ESTADO_INACTIVO, $device->fresh()->estado);
        $this->assertSame(0, DB::table('sessions')->where('user_id', $user->id)->count());
    }

    public function test_super_administrator_can_view_requests_without_explicit_permission(): void
    {
        $superAdministrator = User::factory()->create();
        $superAdministrator->assignRole(Role::findOrCreate(config('access_control.super_admin_role')));
        $user = User::factory()->create();
        $this->createActiveDevice($user, self::AUTHORIZED_TOKEN);
        $resetRequest = SolicitudReseteoDispositivo::factory()->for($user, 'usuario')->create();

        $this->actingAs($superAdministrator)
            ->withCookie(config('device_access.cookie.name'), self::REQUESTING_TOKEN)
            ->get('/users/device-reset-requests')
            ->assertOk();

        $response = $this->actingAs($superAdministrator)
            ->withCookie(config('device_access.cookie.name'), self::REQUESTING_TOKEN)
            ->post("/users/device-reset-requests/{$resetRequest->id}/approval");

        $response->assertRedirect()->assertSessionHasNoErrors();
        $this->assertSame(SolicitudReseteoDispositivo::ESTADO_APROBADA, $resetRequest->fresh()->estado);
    }

    public function test_user_without_permission_cannot_view_or_approve_requests(): void
    {
        $administrator = User::factory()->create();
        $user = User::factory()->create();
        $resetRequest = SolicitudReseteoDispositivo::factory()->for($user, 'usuario')->create();

        $this->actingAs($administrator)
            ->withCookie(config('device_access.cookie.name'), self::REQUESTING_TOKEN)
            ->get('/users/device-reset-requests')
            ->assertForbidden();

        $this->actingAs($administrator)
            ->withCookie(config('device_access.cookie.name'), self::REQUESTING_TOKEN)
            ->post("/users/device-reset-requests/{$resetRequest->id}/approval")
            ->assertForbidden();

        $this->assertSame(SolicitudReseteoDispositivo::ESTADO_PENDIENTE, $resetRequest->fresh()->estado);
    }

    private function requestReset(User $user): TestResponse
    {
        $loginResponse = $this
            ->withCookie(config('device_access.cookie.name'), self::REQUESTING_TOKEN)
            ->post('/login', [
                'email' => $user->email,
                'password' => 'password',
            ]);

        $loginResponse->assertRedirect()->assertSessionHasErrors([
            'device_code' => 'DEVICE_NOT_AUTHORIZED',
        ]);

        $sessionCookie = collect($loginResponse->headers->getCookies())
            ->first(fn ($cookie): bool => $cookie->getName() === config('session.cookie'));

        return $this
            ->withUnencryptedCookie(config('session.cookie'), $sessionCookie->getValue())
            ->withCookie(config('device_access.cookie.name'), self::REQUESTING_TOKEN)
            ->post('/device-reset-requests');
    }

    private function createActiveDevice(User $user, string $token): DispositivoUsuario
    {
        return DispositivoUsuario::factory()->for($user, 'usuario')->create([
            'device_token_hash' => app(DeviceTokenService::class)->hash($token),
        ]);
    }

    private function createActiveSession(User $user, string $sessionId): void
    {
        DB::table('sessions')->insert([
            'id' => $sessionId,
            'user_id' => $user->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'Test browser',
            'payload' => base64_encode(serialize([])),
            'last_activity' => now()->getTimestamp(),
        ]);
    }
}
