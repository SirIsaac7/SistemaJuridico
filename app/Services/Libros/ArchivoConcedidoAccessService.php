<?php

namespace App\Services\Libros;

use App\Models\AccesoMateria;
use App\Models\Archivo;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Support\Facades\Gate;

class ArchivoConcedidoAccessService
{
    public function authorize(User $user, Materia $materia, Archivo $archivo): AccesoMateria
    {
        abort_unless((int) $archivo->materia_id === (int) $materia->getKey(), 404);
        abort_unless($archivo->is_active && $archivo->esVisualizablePorEstudiante(), 404);

        $acceso = AccesoMateria::query()
            ->delUsuario($user)
            ->deMateria($materia)
            ->with('materia')
            ->first();

        abort_unless($acceso, 403);
        Gate::forUser($user)->authorize('view', $acceso);

        return $acceso;
    }
}
