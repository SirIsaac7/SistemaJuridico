<?php

namespace App\Policies;

use App\Models\Archivo;
use App\Models\Materia;
use App\Models\User;

class ArchivoPolicy
{
    public function view(User $user, Archivo $archivo): bool
    {
        return $this->belongsToUser($archivo, $user)
            && $user->can('libros.archivos.ver');
    }

    public function create(User $user, Materia $materia): bool
    {
        return (int) $materia->docente_id === (int) $user->getKey()
            && $materia->is_active
            && $user->can('libros.archivos.subir');
    }

    public function update(User $user, Archivo $archivo): bool
    {
        return $this->belongsToUser($archivo, $user)
            && $user->can('libros.archivos.editar');
    }

    public function updateStatus(User $user, Archivo $archivo): bool
    {
        return $this->belongsToUser($archivo, $user)
            && $user->can('libros.archivos.cambiar-estado');
    }

    private function belongsToUser(Archivo $archivo, User $user): bool
    {
        return (int) $archivo->materia->docente_id === (int) $user->getKey();
    }
}
