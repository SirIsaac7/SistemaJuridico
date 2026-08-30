<?php

namespace Tests\Feature\Policies;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use PHPUnit\Framework\Attributes\DataProvider;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class UserPolicyTest extends TestCase
{
    use RefreshDatabase;

    #[DataProvider('userAbilities')]
    public function test_user_ability_requires_its_exact_permission(string $ability, string $permissionName, bool $requiresTarget): void
    {
        $target = User::factory()->create();
        $allowedUser = User::factory()->create();
        $allowedUser->givePermissionTo(Permission::findOrCreate($permissionName));
        $deniedUser = User::factory()->create();
        $argument = $requiresTarget ? $target : User::class;

        $this->assertTrue(Gate::forUser($allowedUser)->allows($ability, $argument));
        $this->assertFalse(Gate::forUser($deniedUser)->allows($ability, $argument));
    }

    #[DataProvider('selfProtectedAbilities')]
    public function test_user_cannot_run_protected_action_on_self(string $ability, string $permissionName): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo(Permission::findOrCreate($permissionName));

        $this->assertFalse(Gate::forUser($user)->allows($ability, $user));
    }

    /**
     * @return array<string, array{string, string, bool}>
     */
    public static function userAbilities(): array
    {
        return [
            'view any' => ['viewAny', 'usuarios.ver', false],
            'view one' => ['view', 'usuarios.ver', true],
            'create' => ['create', 'usuarios.crear', false],
            'update' => ['update', 'usuarios.editar', true],
            'delete' => ['delete', 'usuarios.eliminar', true],
            'restore' => ['restore', 'usuarios.restaurar', true],
            'update status' => ['updateStatus', 'usuarios.bloquear', true],
            'assign role' => ['assignRole', 'usuarios.asignar-roles', true],
        ];
    }

    /**
     * @return array<string, array{string, string}>
     */
    public static function selfProtectedAbilities(): array
    {
        return [
            'delete' => ['delete', 'usuarios.eliminar'],
            'update status' => ['updateStatus', 'usuarios.bloquear'],
            'assign role' => ['assignRole', 'usuarios.asignar-roles'],
        ];
    }
}
