<?php

namespace Tests\Feature\Console;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GrantSuperAdministratorRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_command_assigns_super_administrator_role_to_existing_user(): void
    {
        $user = User::factory()->create([
            'name' => 'Jose',
            'email' => 'jose@gmail.com',
        ]);

        $this->artisan('access:grant-super-admin', ['email' => 'jose@gmail.com'])
            ->expectsOutput('El rol superadministrador fue asignado a Jose (jose@gmail.com).')
            ->assertSuccessful();

        $this->assertTrue($user->fresh()->hasRole(config('access_control.super_admin_role')));
    }

    public function test_command_fails_when_user_does_not_exist(): void
    {
        $this->artisan('access:grant-super-admin', ['email' => 'nadie@example.com'])
            ->expectsOutput('No existe un usuario con el correo nadie@example.com.')
            ->assertFailed();
    }
}
