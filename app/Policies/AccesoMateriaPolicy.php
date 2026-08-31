<?php

namespace App\Policies;

use App\Models\AccesoMateria;
use App\Models\User;

class AccesoMateriaPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('libros.accesos.ver-propios');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, AccesoMateria $accesoMateria): bool
    {
        $hasNotExpired = $accesoMateria->fecha_fin === null
            || $accesoMateria->fecha_fin->isFuture();

        return (int) $accesoMateria->usuario_id === (int) $user->getKey()
            && $accesoMateria->is_active
            && $hasNotExpired
            && $accesoMateria->materia->is_active
            && $user->can('libros.accesos.ver-propios');
    }
}
