<?php

namespace Tests\Feature\Policies;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolePolicyTest extends TestCase
{
    use RefreshDatabase;

    #[DataProvider('roleAbilities')]
    public function test_role_ability_requires_its_exact_permission(string $ability, string $permissionName, bool $requiresRole): void
    {
        $role = Role::findOrCreate('editor');
        $allowedUser = User::factory()->create();
        $allowedUser->givePermissionTo(Permission::findOrCreate($permissionName));
        $deniedUser = User::factory()->create();
        $argument = $requiresRole ? $role : Role::class;

        $this->assertTrue(Gate::forUser($allowedUser)->allows($ability, $argument));
        $this->assertFalse(Gate::forUser($deniedUser)->allows($ability, $argument));
    }

    public function test_super_administrator_is_allowed_every_role_ability(): void
    {
        $superRole = Role::findOrCreate(config('access_control.super_admin_role'));
        $role = Role::findOrCreate('editor');
        $user = User::factory()->create();
        $user->assignRole($superRole);

        foreach (self::roleAbilities() as [$ability, , $requiresRole]) {
            $argument = $requiresRole ? $role : Role::class;

            $this->assertTrue(Gate::forUser($user)->allows($ability, $argument));
        }
    }

    /**
     * @return array<string, array{string, string, bool}>
     */
    public static function roleAbilities(): array
    {
        return [
            'view any' => ['viewAny', 'roles.ver', false],
            'view one' => ['view', 'roles.ver', true],
            'create' => ['create', 'roles.crear', false],
            'update' => ['update', 'roles.editar', true],
            'delete' => ['delete', 'roles.eliminar', true],
            'assign permissions' => ['assignPermissions', 'roles.asignar-permisos', true],
        ];
    }
}
