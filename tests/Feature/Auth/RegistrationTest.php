<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use App\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_register_as_unverified_and_receive_queued_verification_email(): void
    {
        Notification::fake();

        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $user = User::query()->where('email', 'test@example.com')->firstOrFail();

        $this->assertAuthenticated();
        $response->assertRedirect(route('verification.notice', absolute: false));
        $this->assertFalse($user->hasVerifiedEmail());
        $this->assertDatabaseHas('dispositivos_usuario', [
            'usuario_id' => $user->id,
            'estado' => 'activo',
        ]);
        Notification::assertSentTo($user, VerifyEmail::class, function (VerifyEmail $notification, array $channels) use ($user): bool {
            $mail = $notification->toMail($user);
            $html = view('mail.verify-email', $mail->viewData)->render();

            return $channels === ['mail']
                && $notification->queue === 'mail'
                && $notification->afterCommit === true
                && $mail->subject === 'Verifica tu correo electrónico'
                && str_contains($html, 'Verificar mi correo')
                && str_contains($html, 'no cambiará el dispositivo autorizado');
        });
    }

    #[DataProvider('weakPasswords')]
    public function test_registration_rejects_passwords_that_do_not_meet_security_requirements(string $password): void
    {
        $response = $this->from('/register')->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => $password,
            'password_confirmation' => $password,
        ]);

        $response
            ->assertRedirect('/register')
            ->assertSessionHasErrors('password');
        $this->assertGuest();
        $this->assertDatabaseMissing('users', ['email' => 'test@example.com']);
    }

    /** @return array<string, array{string}> */
    public static function weakPasswords(): array
    {
        return [
            'menos de ocho caracteres' => ['Pa1!'],
            'sin mayúscula' => ['password1!'],
            'sin minúscula' => ['PASSWORD1!'],
            'sin número' => ['Password!'],
            'sin carácter especial' => ['Password1'],
        ];
    }
}
