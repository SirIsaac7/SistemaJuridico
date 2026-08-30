<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('usuarios.ver');
    }

    public function view(User $user, User $targetUser): bool
    {
        return $user->can('usuarios.ver');
    }

    public function create(User $user): bool
    {
        return $user->can('usuarios.crear');
    }

    public function update(User $user, User $targetUser): bool
    {
        return $user->can('usuarios.editar');
    }

    public function delete(User $user, User $targetUser): bool
    {
        return $user->isNot($targetUser) && $user->can('usuarios.eliminar');
    }

    public function restore(User $user, User $targetUser): bool
    {
        return $user->can('usuarios.restaurar');
    }

    public function updateStatus(User $user, User $targetUser): bool
    {
        return $user->isNot($targetUser) && $user->can('usuarios.bloquear');
    }

    public function assignRole(User $user, User $targetUser): bool
    {
        return $user->isNot($targetUser) && $user->can('usuarios.asignar-roles');
    }
}
