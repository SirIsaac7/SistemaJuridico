<?php

namespace App\Services\Libros;

use App\Models\Materia;
use App\Models\User;

class MateriaService
{
    /**
     * @param  array{nombre: string, descripcion?: string|null}  $data
     */
    public function create(User $docente, array $data): Materia
    {
        return $docente->materiasImpartidas()->create($data);
    }

    /**
     * @param  array{nombre: string, descripcion?: string|null}  $data
     */
    public function update(Materia $materia, array $data): Materia
    {
        $materia->update($data);

        return $materia->refresh();
    }

    public function updateStatus(Materia $materia, bool $isActive): Materia
    {
        $materia->update(['is_active' => $isActive]);

        return $materia->refresh();
    }
}
