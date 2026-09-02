<?php

namespace App\Services\Libros;

use App\Models\AccesoMateria;
use App\Models\Materia;
use App\Models\User;

class MateriaAccessService
{
    /** @return array{can_supervise: bool, can_manage: bool, access: AccesoMateria|null} */
    public function resolve(User $user, Materia $materia): array
    {
        $canSupervise = $user->can('libros.administracion.ver');
        $canManage = (int) $materia->docente_id === (int) $user->getKey()
            && $user->can('libros.materias.ver');
        $access = null;

        if ($user->can('libros.accesos.ver-propios')) {
            $access = AccesoMateria::query()
                ->delUsuario($user)
                ->deMateria($materia)
                ->vigentes()
                ->with('materia')
                ->first();
        }

        abort_unless($canSupervise || $canManage || $access !== null, 403);

        return [
            'can_supervise' => $canSupervise,
            'can_manage' => $canManage,
            'access' => $access,
        ];
    }
}
