<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/users')->assertRedirect('/login');
    }

    public function test_user_without_permission_cannot_view_users(): void
    {
        $this->actingAs(User::factory()->create())
            ->get('/users')
            ->assertForbidden();
    }

    public function test_user_with_permission_can_view_filtered_users(): void
    {
        $this->withoutVite();
        $administrator = $this->userWithPermissions('usuarios.ver');
        $studentRole = Role::findOrCreate('estudiante');
        $student = User::factory()->create(['name' => 'María Estudiante', 'is_active' => true]);
        $student->assignRole($studentRole);
        User::factory()->create(['name' => 'Persona Bloqueada', 'is_active' => false])->assignRole($studentRole);

        $response = $this->actingAs($administrator)->get("/users?status=active&role={$studentRole->id}&search=María");

        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/users/index')
            ->has('users.data', 1)
            ->where('users.data.0.id', $student->id)
            ->where('filters.status', 'active')
            ->where('filters.role', $studentRole->id));
    }

    public function test_users_are_listed_newest_first_with_local_date_and_time(): void
    {
        $this->withoutVite();
        config(['app.display_timezone' => 'America/La_Paz']);

        $administrator = $this->userWithPermissions('usuarios.ver');
        $olderUser = User::factory()->create([
            'name' => 'Orden Anterior',
            'created_at' => '2026-08-28 14:00:00',
        ]);
        $newerUser = User::factory()->create([
            'name' => 'Orden Reciente',
            'created_at' => '2026-08-30 00:30:00',
        ]);

        $this->actingAs($administrator)
            ->get('/users?search=Orden')
            ->assertInertia(fn (Assert $page) => $page
                ->where('users.data.0.id', $newerUser->id)
                ->where('users.data.0.created_at', '29/08/2026 20:30')
                ->where('users.data.1.id', $olderUser->id));
    }

    public function test_authorized_user_can_create_user_with_one_role(): void
    {
        $administrator = $this->userWithPermissions('usuarios.crear', 'usuarios.asignar-roles');
        $role = Role::findOrCreate('estudiante');

        $response = $this->actingAs($administrator)->post('/users', [
            'name' => 'Ana Pérez',
            'email' => 'ANA@EXAMPLE.COM',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_id' => $role->id,
        ]);

        $response->assertRedirect()->assertSessionHasNoErrors();
        $user = User::query()->where('email', 'ana@example.com')->firstOrFail();
        $this->assertTrue($user->hasExactRoles($role));
        $this->assertTrue($user->is_active);
    }

    public function test_duplicate_email_is_rejected_with_visible_message(): void
    {
        User::factory()->create(['email' => 'ana@example.com']);
        $administrator = $this->userWithPermissions('usuarios.crear', 'usuarios.asignar-roles');
        $role = Role::findOrCreate('estudiante');

        $response = $this->actingAs($administrator)->from('/users')->post('/users', [
            'name' => 'Otra Ana',
            'email' => 'ana@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role_id' => $role->id,
        ]);

        $response->assertRedirect('/users')
            ->assertSessionHasErrors(['email' => 'Ya existe un usuario con ese correo electrónico.']);
    }

    public function test_authorized_user_can_update_data_and_role(): void
    {
        $administrator = $this->userWithPermissions('usuarios.editar', 'usuarios.asignar-roles');
        $oldRole = Role::findOrCreate('estudiante');
        $newRole = Role::findOrCreate('docente');
        $user = User::factory()->create()->assignRole($oldRole);

        $response = $this->actingAs($administrator)->put("/users/{$user->id}", [
            'name' => 'Nombre Actualizado',
            'email' => 'actualizado@example.com',
            'password' => '',
            'password_confirmation' => '',
            'role_id' => $newRole->id,
        ]);

        $response->assertRedirect()->assertSessionHasNoErrors();
        $user->refresh();
        $this->assertSame('Nombre Actualizado', $user->name);
        $this->assertSame('actualizado@example.com', $user->email);
        $this->assertTrue($user->hasExactRoles($newRole));
    }

    public function test_authorized_user_can_block_and_activate_another_user(): void
    {
        $administrator = $this->userWithPermissions('usuarios.bloquear');
        $user = User::factory()->create(['is_active' => true]);

        $this->actingAs($administrator)
            ->put("/users/{$user->id}/status", ['is_active' => false])
            ->assertRedirect()
            ->assertSessionHasNoErrors();
        $this->assertFalse($user->fresh()->is_active);

        $this->actingAs($administrator)
            ->put("/users/{$user->id}/status", ['is_active' => true])
            ->assertRedirect()
            ->assertSessionHasNoErrors();
        $this->assertTrue($user->fresh()->is_active);
    }

    public function test_blocked_user_cannot_log_in(): void
    {
        $user = User::factory()->create([
            'email' => 'bloqueado@example.com',
            'password' => 'password123',
            'is_active' => false,
        ]);

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password123',
        ]);

        $response->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_user_cannot_block_own_account(): void
    {
        $user = $this->userWithPermissions('usuarios.bloquear');

        $this->actingAs($user)
            ->put("/users/{$user->id}/status", ['is_active' => false])
            ->assertForbidden();
        $this->assertTrue($user->fresh()->is_active);
    }

    public function test_authorized_user_can_soft_delete_and_restore_user(): void
    {
        $administrator = $this->userWithPermissions('usuarios.eliminar', 'usuarios.restaurar');
        $role = Role::findOrCreate('estudiante');
        $user = User::factory()->create()->assignRole($role);

        $this->actingAs($administrator)
            ->delete("/users/{$user->id}")
            ->assertRedirect()
            ->assertSessionHasNoErrors();
        $this->assertSoftDeleted($user);

        $this->actingAs($administrator)
            ->put("/deleted-users/{$user->id}")
            ->assertRedirect()
            ->assertSessionHasNoErrors();
        $this->assertNotSoftDeleted($user);
        $this->assertTrue($user->fresh()->hasExactRoles($role));
    }

    public function test_user_cannot_delete_own_account(): void
    {
        $user = $this->userWithPermissions('usuarios.eliminar');

        $this->actingAs($user)
            ->delete("/users/{$user->id}")
            ->assertForbidden();
        $this->assertNotSoftDeleted($user);
    }

    public function test_last_super_administrator_cannot_be_deleted_blocked_or_demoted(): void
    {
        $superRole = Role::findOrCreate(config('access_control.super_admin_role'));
        $otherRole = Role::findOrCreate('estudiante');
        $superAdministrator = User::factory()->create()->assignRole($superRole);
        $administrator = $this->userWithPermissions(
            'usuarios.eliminar',
            'usuarios.bloquear',
            'usuarios.editar',
            'usuarios.asignar-roles',
        );

        $this->actingAs($administrator)
            ->delete("/users/{$superAdministrator->id}")
            ->assertSessionHasErrors('user');
        $this->assertNotSoftDeleted($superAdministrator);

        $this->actingAs($administrator)
            ->put("/users/{$superAdministrator->id}/status", ['is_active' => false])
            ->assertSessionHasErrors('user');
        $this->assertTrue($superAdministrator->fresh()->is_active);

        $this->actingAs($administrator)
            ->put("/users/{$superAdministrator->id}", [
                'name' => $superAdministrator->name,
                'email' => $superAdministrator->email,
                'password' => '',
                'password_confirmation' => '',
                'role_id' => $otherRole->id,
            ])
            ->assertSessionHasErrors('user');
        $this->assertTrue($superAdministrator->fresh()->hasRole($superRole));
    }

    private function userWithPermissions(string ...$permissions): User
    {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            $user->givePermissionTo(Permission::findOrCreate($permission));
        }

        return $user;
    }
}
