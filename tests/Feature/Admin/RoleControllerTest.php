<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RoleControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login(): void
    {
        $this->get('/roles')->assertRedirect('/login');
    }

    public function test_user_without_permission_cannot_view_roles(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->get('/roles')->assertForbidden();
    }

    public function test_user_with_permission_can_view_roles(): void
    {
        $this->withoutVite();
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('roles.ver'));
        Role::findOrCreate('editor');

        $response = $this->actingAs($user)->get('/roles');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/roles/index')
            ->has('roles', 1)
            ->where('roles.0.name', 'editor'));
    }

    public function test_roles_are_listed_newest_first_with_local_date_and_time(): void
    {
        $this->withoutVite();
        config(['app.display_timezone' => 'America/La_Paz']);

        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('roles.ver'));

        $olderRole = Role::findOrCreate('rol-anterior');
        $olderRole->forceFill(['created_at' => '2026-08-28 14:00:00'])->saveQuietly();

        $newerRole = Role::findOrCreate('rol-reciente');
        $newerRole->forceFill(['created_at' => '2026-08-30 00:30:00'])->saveQuietly();

        $this->actingAs($user)
            ->get('/roles')
            ->assertInertia(fn (Assert $page) => $page
                ->where('roles.0.id', $newerRole->id)
                ->where('roles.0.created_at', '29/08/2026 20:30')
                ->where('roles.1.id', $olderRole->id));
    }

    public function test_user_with_permission_can_create_role(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('roles.crear'));

        $response = $this->actingAs($user)->post('/roles', [
            'name' => 'Administrador de Contenido',
        ]);

        $response->assertRedirect()->assertSessionHasNoErrors();
        $this->assertDatabaseHas('roles', [
            'name' => 'administrador-de-contenido',
            'guard_name' => 'web',
        ]);
    }

    public function test_duplicate_role_name_is_rejected(): void
    {
        Role::findOrCreate('administrador');
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('roles.crear'));

        $response = $this->actingAs($user)->post('/roles', ['name' => 'Administrador']);

        $response->assertSessionHasErrors('name');
        $this->assertSame(1, Role::query()->where('name', 'administrador')->count());
    }

    public function test_super_administrator_role_cannot_be_renamed(): void
    {
        $role = Role::findOrCreate(config('access_control.super_admin_role'));
        $user = User::factory()->create();
        $user->assignRole($role);

        $response = $this->actingAs($user)->put("/roles/{$role->id}", ['name' => 'otro-nombre']);

        $response->assertForbidden();
        $this->assertDatabaseHas('roles', ['id' => $role->id, 'name' => config('access_control.super_admin_role')]);
    }

    public function test_role_assigned_to_users_cannot_be_deleted(): void
    {
        $role = Role::findOrCreate('editor');
        User::factory()->create()->assignRole($role);
        $administrator = User::factory()->create();
        $administrator->givePermissionTo(Permission::findOrCreate('roles.eliminar'));

        $response = $this->actingAs($administrator)->delete("/roles/{$role->id}");

        $response->assertSessionHasErrors('role');
        $this->assertModelExists($role);
    }

    public function test_user_with_permission_can_delete_unassigned_role(): void
    {
        $role = Role::findOrCreate('temporal');
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('roles.eliminar'));

        $response = $this->actingAs($user)->delete("/roles/{$role->id}");

        $response->assertRedirect()->assertSessionHasNoErrors();
        $this->assertModelMissing($role);
    }
}
