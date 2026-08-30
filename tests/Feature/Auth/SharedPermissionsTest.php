<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SharedPermissionsTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_receives_only_authorized_permissions(): void
    {
        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findByName('roles.ver'));

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertInertia(fn (Assert $page) => $page
            ->where('auth.roles', [])
            ->where('auth.permissions', ['roles.ver']));
    }

    public function test_super_administrator_receives_every_catalog_permission(): void
    {
        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);
        $user = User::factory()->create();
        $user->assignRole(config('access_control.super_admin_role'));

        $response = $this->actingAs($user)->get('/dashboard');
        $permissionCount = collect(config('access_control.permission_groups'))->sum(
            fn (array $group): int => count($group['permissions'])
        );

        $response->assertInertia(fn (Assert $page) => $page
            ->where('auth.roles', [config('access_control.super_admin_role')])
            ->has('auth.permissions', $permissionCount));
    }
}
