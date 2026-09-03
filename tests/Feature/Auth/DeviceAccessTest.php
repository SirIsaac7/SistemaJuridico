<?php

namespace Tests\Feature\Auth;

use App\Models\DispositivoUsuario;
use App\Models\User;
use App\Notifications\DeviceResetCompleted;
use App\Services\Auth\DeviceDescriptorService;
use App\Services\Auth\DeviceTokenService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use Mockery\MockInterface;
use RuntimeException;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class DeviceAccessTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN_A = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

    private const TOKEN_B = 'BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';

    public function test_first_login_authorizes_browser_and_creates_single_session(): void
    {
        $user = User::factory()->create(['email' => 'isaac@example.com']);

        $response = $this
            ->withCookie(config('device_access.cookie.name'), self::TOKEN_A)
            ->withHeaders([
                'User-Agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0 Safari/537.36',
                'Sec-CH-UA-Platform' => '"Windows"',
                'Sec-CH-UA-Platform-Version' => '"13.0.0"',
            ])
            ->post('/login', $this->credentials($user));

        $response->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseHas('dispositivos_usuario', [
            'usuario_id' => $user->id,
            'device_token_hash' => $this->tokenHash(self::TOKEN_A),
            'tipo_dispositivo' => 'PC/Laptop',
            'sistema_operativo' => 'Windows 11',
            'navegador' => 'Chrome',
            'estado' => DispositivoUsuario::ESTADO_ACTIVO,
        ]);
        $this->assertDatabaseMissing('dispositivos_usuario', ['device_token_hash' => self::TOKEN_A]);
        $this->assertSame(1, DB::table('sessions')->where('user_id', $user->id)->count());
    }

    public function test_logout_keeps_device_and_allows_login_from_same_browser(): void
    {
        $user = User::factory()->create();
        $cookieName = config('device_access.cookie.name');

        $loginResponse = $this->withCookie($cookieName, self::TOKEN_A)->post('/login', $this->credentials($user));
        $sessionCookie = collect($loginResponse->headers->getCookies())
            ->first(fn ($cookie): bool => $cookie->getName() === config('session.cookie'));

        $this->withUnencryptedCookie(config('session.cookie'), $sessionCookie->getValue())
            ->post('/logout')
            ->assertRedirect('/');
        $this->assertGuest();
        $this->assertDatabaseHas('dispositivos_usuario', [
            'usuario_id' => $user->id,
            'estado' => DispositivoUsuario::ESTADO_ACTIVO,
        ]);
        $this->assertSame(0, DB::table('sessions')->where('user_id', $user->id)->count());

        $this->withCookie($cookieName, self::TOKEN_A)
            ->post('/login', $this->credentials($user))
            ->assertRedirect(route('dashboard', absolute: false));
        $this->assertAuthenticatedAs($user);
    }

    public function test_returns_409_when_another_active_session_exists(): void
    {
        $user = User::factory()->create();
        $this->createActiveDevice($user, self::TOKEN_A);
        $this->createActiveSession($user, 'existing-session');

        $response = $this
            ->withCredentials()
            ->withCookie(config('device_access.cookie.name'), self::TOKEN_A)
            ->postJson('/login', $this->credentials($user));

        $response->assertConflict()->assertExactJson([
            'code' => 'ACTIVE_SESSION_EXISTS',
            'message' => 'Ya tienes una sesión activa. Cierra tu sesión anterior antes de iniciar nuevamente.',
        ]);
        $this->assertGuest();
        $this->assertSame(1, DB::table('sessions')->where('user_id', $user->id)->count());
    }

    public function test_returns_403_when_browser_token_is_not_authorized(): void
    {
        $user = User::factory()->create();
        $this->createActiveDevice($user, self::TOKEN_A);

        $response = $this
            ->withCredentials()
            ->withCookie(config('device_access.cookie.name'), self::TOKEN_B)
            ->postJson('/login', $this->credentials($user));

        $response->assertForbidden()->assertExactJson([
            'code' => 'DEVICE_NOT_AUTHORIZED',
            'message' => 'Tu cuenta ya está vinculada a otro navegador o dispositivo. Solicita un cambio de dispositivo para acceder.',
        ]);
        $this->assertGuest();
        $this->assertDatabaseCount('dispositivos_usuario', 1);
    }

    public function test_authorized_administrator_can_reset_device_and_close_sessions(): void
    {
        Notification::fake();

        $administrator = User::factory()->create();
        $administrator->givePermissionTo(Permission::findOrCreate('usuarios.resetear-dispositivo'));
        $user = User::factory()->create();
        $device = $this->createActiveDevice($user, self::TOKEN_A);
        $this->createActiveSession($user, 'session-to-close');

        $response = $this
            ->actingAs($administrator)
            ->withCookie(config('device_access.cookie.name'), self::TOKEN_B)
            ->put("/users/{$user->id}/device/reset");

        $response->assertRedirect()->assertSessionHasNoErrors();
        $this->assertSame(DispositivoUsuario::ESTADO_INACTIVO, $device->fresh()->estado);
        $this->assertSame(0, DB::table('sessions')->where('user_id', $user->id)->count());
        Notification::assertSentTo($user, DeviceResetCompleted::class, function (DeviceResetCompleted $notification, array $channels) use ($user): bool {
            $mail = $notification->toMail($user);
            $html = view('mail.device-reset-completed', $mail->viewData)->render();
            $text = view('mail.device-reset-completed-text', $mail->viewData)->render();

            return $channels === ['mail']
                && $notification->queue === 'mail'
                && $notification->afterCommit === true
                && $mail->subject === 'Tu dispositivo fue restablecido'
                && $mail->view === [
                    'html' => 'mail.device-reset-completed',
                    'text' => 'mail.device-reset-completed-text',
                ]
                && str_contains($html, 'Normativa Virtual')
                && str_contains($html, 'assets/landing/normativa-virtual-email.png')
                && str_contains($html, 'Ya puedes iniciar sesión desde otro dispositivo y navegador.')
                && str_contains($html, route('login'))
                && str_contains($text, 'Ya puedes iniciar sesión desde otro dispositivo y navegador.')
                && ! str_contains($html, 'Regards,');
        });
    }

    public function test_user_without_permission_cannot_reset_device(): void
    {
        Notification::fake();

        $administrator = User::factory()->create();
        $user = User::factory()->create();
        $device = $this->createActiveDevice($user, self::TOKEN_A);

        $this
            ->actingAs($administrator)
            ->withCookie(config('device_access.cookie.name'), self::TOKEN_B)
            ->put("/users/{$user->id}/device/reset")
            ->assertForbidden();

        $this->assertSame(DispositivoUsuario::ESTADO_ACTIVO, $device->fresh()->estado);
        Notification::assertNothingSent();
    }

    public function test_login_after_reset_authorizes_new_browser_and_preserves_history(): void
    {
        $user = User::factory()->create();
        $this->createActiveDevice($user, self::TOKEN_A)->update([
            'estado' => DispositivoUsuario::ESTADO_INACTIVO,
        ]);

        $this
            ->withCookie(config('device_access.cookie.name'), self::TOKEN_B)
            ->post('/login', $this->credentials($user))
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseCount('dispositivos_usuario', 2);
        $this->assertDatabaseHas('dispositivos_usuario', [
            'usuario_id' => $user->id,
            'device_token_hash' => $this->tokenHash(self::TOKEN_A),
            'estado' => DispositivoUsuario::ESTADO_INACTIVO,
        ]);
        $this->assertDatabaseHas('dispositivos_usuario', [
            'usuario_id' => $user->id,
            'device_token_hash' => $this->tokenHash(self::TOKEN_B),
            'estado' => DispositivoUsuario::ESTADO_ACTIVO,
        ]);
    }

    public function test_login_after_reset_reactivates_same_browser_without_creating_duplicate(): void
    {
        $this->travelTo('2026-09-01 12:00:00');
        $user = User::factory()->create();
        $device = $this->createActiveDevice($user, self::TOKEN_A);
        $device->update(['estado' => DispositivoUsuario::ESTADO_INACTIVO]);
        $this->travel(1)->hour();

        $this
            ->withCookie(config('device_access.cookie.name'), self::TOKEN_A)
            ->post('/login', $this->credentials($user))
            ->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticatedAs($user);
        $this->assertDatabaseCount('dispositivos_usuario', 1);
        $this->assertDatabaseHas('dispositivos_usuario', [
            'id' => $device->id,
            'usuario_id' => $user->id,
            'device_token_hash' => $this->tokenHash(self::TOKEN_A),
            'estado' => DispositivoUsuario::ESTADO_ACTIVO,
            'fecha_vinculacion' => '2026-09-01 13:00:00',
        ]);
        $this->travelBack();
    }

    public function test_unexpected_login_failure_does_not_leave_authenticated_session(): void
    {
        $user = User::factory()->create();
        $this->mock(DeviceDescriptorService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('detect')
                ->once()
                ->andThrow(new RuntimeException('Fallo controlado durante la vinculación.'));
        });

        $response = $this
            ->withCookie(config('device_access.cookie.name'), self::TOKEN_A)
            ->post('/login', $this->credentials($user));

        $response->assertServerError();
        $this->assertGuest();
        $this->assertSame(0, DB::table('sessions')->where('user_id', $user->id)->count());
        $this->assertDatabaseCount('dispositivos_usuario', 0);
    }

    public function test_old_authenticated_session_is_rejected_after_device_reset(): void
    {
        $user = User::factory()->create();
        $this->createActiveDevice($user, self::TOKEN_A)->update([
            'estado' => DispositivoUsuario::ESTADO_INACTIVO,
        ]);

        $response = $this
            ->actingAs($user)
            ->withCookie(config('device_access.cookie.name'), self::TOKEN_A)
            ->get('/dashboard');

        $response->assertRedirect(route('login'))
            ->assertSessionHasErrors([
                'device' => 'Tu cuenta ya está vinculada a otro navegador o dispositivo. Solicita un cambio de dispositivo para acceder.',
            ]);
        $this->assertGuest();
    }

    private function createActiveDevice(User $user, string $token): DispositivoUsuario
    {
        return DispositivoUsuario::factory()->for($user, 'usuario')->create([
            'device_token_hash' => $this->tokenHash($token),
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

    /**
     * @return array{email: string, password: string}
     */
    private function credentials(User $user): array
    {
        return [
            'email' => $user->email,
            'password' => 'password',
        ];
    }

    private function tokenHash(string $token): string
    {
        return app(DeviceTokenService::class)->hash($token);
    }
}
