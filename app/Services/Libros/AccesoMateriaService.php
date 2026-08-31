<?php

namespace App\Services\Libros;

use App\Models\AccesoMateria;
use App\Models\SolicitudAcceso;

class AccesoMateriaService
{
    public function grant(SolicitudAcceso $solicitud): AccesoMateria
    {
        return AccesoMateria::query()->updateOrCreate(
            [
                'usuario_id' => $solicitud->usuario_id,
                'materia_id' => $solicitud->materia_id,
            ],
            [
                'solicitud_id' => $solicitud->getKey(),
                'fecha_inicio' => $solicitud->fecha_respuesta ?? now(),
                'fecha_fin' => null,
                'is_active' => true,
            ],
        );
    }
}
