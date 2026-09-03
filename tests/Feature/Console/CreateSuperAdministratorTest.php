<?php

namespace Tests\Feature\Console;

use App\Models\User;
use App\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class CreateSuperAdministratorTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_creates_unverified_super_administrator_and_sends_verification_email(): void
    {
        Notification::fake();

        $this->artisan('access:create-super-admin')
            ->expectsQuestion('Nombre completo', 'Ana Administradora')
            ->expectsQuestion('Correo electrónico', 'ANA@EXAMPLE.COM')
            ->expectsQuestion('Contraseña', 'Password123!')
            ->expectsQuestion('Confirmar contraseña', 'Password123!')
            ->expectsConfirmation('¿Crear la cuenta superadministradora para ana@example.com?', 'yes')
            ->expectsOutput('La cuenta superadministradora fue creada para Ana Administradora (ana@example.com).')
            ->expectsOutput('Revisa ese correo y completa la verificación antes de iniciar sesión.')
            ->assertSuccessful();

        $user = User::query()->where('email', 'ana@example.com')->firstOrFail();

        $this->assertTrue($user->hasRole(config('access_control.super_admin_role')));
        $this->assertTrue($user->is_active);
        $this->assertFalse($user->hasVerifiedEmail());
        $this->assertTrue(Hash::check('Password123!', $user->password));
        Notification::assertSentTo($user, VerifyEmail::class);
    }

    public function test_command_rejects_invalid_data_without_creating_user(): void
    {
        $this->artisan('access:create-super-admin')
            ->expectsQuestion('Nombre completo', '')
            ->expectsQuestion('Correo electrónico', 'correo-invalido')
            ->expectsQuestion('Contraseña', 'débil')
            ->expectsQuestion('Confirmar contraseña', 'diferente')
            ->expectsOutput('Debes ingresar el nombre completo.')
            ->expectsOutput('El correo electrónico no tiene un formato válido.')
            ->expectsOutput('La confirmación de la contraseña no coincide.')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }

    public function test_command_does_not_create_user_when_confirmation_is_rejected(): void
    {
        $this->artisan('access:create-super-admin')
            ->expectsQuestion('Nombre completo', 'Ana Administradora')
            ->expectsQuestion('Correo electrónico', 'ana@example.com')
            ->expectsQuestion('Contraseña', 'Password123!')
            ->expectsQuestion('Confirmar contraseña', 'Password123!')
            ->expectsConfirmation('¿Crear la cuenta superadministradora para ana@example.com?', 'no')
            ->expectsOutput('La creación fue cancelada. No se realizó ningún cambio.')
            ->assertFailed();

        $this->assertDatabaseCount('users', 0);
    }
}
