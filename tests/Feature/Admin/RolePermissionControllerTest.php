<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolePermissionControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_without_permission_cannot_edit_role_permissions(): void
    {
        $user = User::factory()->create();
        $role = Role::findOrCreate('editor');

        $this->actingAs($user)->get("/roles/{$role->id}/permissions")->assertForbidden();
    }

    public function test_user_with_permission_can_view_permission_assignment_page(): void
    {
        $this->withoutVite();
        $permission = Permission::findOrCreate('roles.asignar-permisos');
        $user = User::factory()->create();
        $user->givePermissionTo($permission);
        $role = Role::findOrCreate('editor');

        $response = $this->actingAs($user)->get("/roles/{$role->id}/permissions");

        $response->assertInertia(fn (Assert $page) => $page
            ->component('admin/roles/permissions')
            ->where('role.name', 'editor'));
    }

    public function test_user_with_permission_can_replace_role_permissions(): void
    {
        $assignPermission = Permission::findOrCreate('roles.asignar-permisos');
        $viewPermission = Permission::findOrCreate('roles.ver');
        $createPermission = Permission::findOrCreate('roles.crear');
        $role = Role::findOrCreate('editor');
        $role->givePermissionTo($viewPermission);
        $user = User::factory()->create();
        $user->givePermissionTo($assignPermission);

        $response = $this->actingAs($user)->put("/roles/{$role->id}/permissions", [
            'permissions' => [$createPermission->name],
        ]);

        $response->assertRedirect()->assertSessionHasNoErrors();
        $this->assertTrue($role->fresh()->hasPermissionTo($createPermission));
        $this->assertFalse($role->fresh()->hasPermissionTo($viewPermission));
    }

    public function test_unknown_permission_is_rejected(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate('roles.asignar-permisos'));
        $role = Role::findOrCreate('editor');

        $response = $this->actingAs($user)->put("/roles/{$role->id}/permissions", [
            'permissions' => ['roles.no-existe'],
        ]);

        $response->assertSessionHasErrors('permissions.0');
        $this->assertSame(0, $role->fresh()->permissions()->count());
    }

    public function test_super_administrator_permissions_cannot_be_modified(): void
    {
        $role = Role::findOrCreate(config('access_control.super_admin_role'));
        $user = User::factory()->create();
        $user->assignRole($role);

        $response = $this->actingAs($user)->put("/roles/{$role->id}/permissions", [
            'permissions' => [],
        ]);

        $response->assertForbidden();
    }
}
