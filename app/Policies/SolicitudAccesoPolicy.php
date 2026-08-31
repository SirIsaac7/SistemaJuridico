<?php

namespace App\Policies;

use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Models\User;

class SolicitudAccesoPolicy
{
    public function viewOwnAny(User $user): bool
    {
        return $user->can('libros.solicitudes.ver-propias');
    }

    public function viewReceivedAny(User $user): bool
    {
        return $user->can('libros.solicitudes.ver-recibidas');
    }

    public function view(User $user, SolicitudAcceso $solicitud): bool
    {
        $isApplicant = (int) $solicitud->usuario_id === (int) $user->getKey()
            && $user->can('libros.solicitudes.ver-propias');
        $isTeacher = (int) $solicitud->materia->docente_id === (int) $user->getKey()
            && $user->can('libros.solicitudes.ver-recibidas');

        return $isApplicant || $isTeacher;
    }

    public function create(User $user, Materia $materia): bool
    {
        return $materia->is_active
            && (int) $materia->docente_id !== (int) $user->getKey()
            && $user->can('libros.solicitudes.crear');
    }

    public function respond(User $user, SolicitudAcceso $solicitud): bool
    {
        return (int) $solicitud->materia->docente_id === (int) $user->getKey()
            && $user->can('libros.solicitudes.responder');
    }
}
