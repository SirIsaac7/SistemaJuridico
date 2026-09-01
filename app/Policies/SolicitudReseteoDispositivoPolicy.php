<?php

namespace App\Policies;

use App\Models\SolicitudReseteoDispositivo;
use App\Models\User;

class SolicitudReseteoDispositivoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('usuarios.resetear-dispositivo');
    }

    public function approve(User $user, SolicitudReseteoDispositivo $resetRequest): bool
    {
        return $user->isNot($resetRequest->usuario)
            && $user->can('usuarios.resetear-dispositivo');
    }
}
