<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('roles.ver');
    }

    public function view(User $user, Role $role): bool
    {
        return $user->can('roles.ver');
    }

    public function create(User $user): bool
    {
        return $user->can('roles.crear');
    }

    public function update(User $user, Role $role): bool
    {
        return $user->can('roles.editar');
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->can('roles.eliminar');
    }

    public function assignPermissions(User $user, Role $role): bool
    {
        return $user->can('roles.asignar-permisos');
    }
}
