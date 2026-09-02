<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
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

    public function test_new_users_can_register()
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
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
