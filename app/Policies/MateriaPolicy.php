<?php

namespace App\Policies;

use App\Models\Materia;
use App\Models\User;

class MateriaPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('libros.materias.ver');
    }

    public function viewCatalog(User $user): bool
    {
        return $user->can('libros.catalogo.ver');
    }

    public function view(User $user, Materia $materia): bool
    {
        return $this->belongsToUser($materia, $user)
            && $user->can('libros.materias.ver');
    }

    public function create(User $user): bool
    {
        return $user->can('libros.materias.crear');
    }

    public function update(User $user, Materia $materia): bool
    {
        return $this->belongsToUser($materia, $user)
            && $user->can('libros.materias.editar');
    }

    public function updateStatus(User $user, Materia $materia): bool
    {
        return $this->belongsToUser($materia, $user)
            && $user->can('libros.materias.cambiar-estado');
    }

    private function belongsToUser(Materia $materia, User $user): bool
    {
        return (int) $materia->docente_id === (int) $user->getKey();
    }
}
