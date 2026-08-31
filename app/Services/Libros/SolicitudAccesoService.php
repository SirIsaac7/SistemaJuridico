<?php

namespace App\Services\Libros;

use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SolicitudAccesoService
{
    public function __construct(private AccesoMateriaService $accesoMateriaService) {}

    /**
     * @param  array{universidad: string, observacion?: string|null}  $data
     */
    public function create(User $usuario, Materia $materia, array $data): SolicitudAcceso
    {
        return DB::transaction(function () use ($usuario, $materia, $data): SolicitudAcceso {
            $lockedSubject = Materia::query()
                ->lockForUpdate()
                ->findOrFail($materia->getKey());

            if (! $lockedSubject->is_active) {
                throw ValidationException::withMessages([
                    'materia' => 'Esta materia ya no está disponible.',
                ]);
            }

            $hasCurrentRequest = SolicitudAcceso::query()
                ->whereBelongsTo($usuario, 'usuario')
                ->whereBelongsTo($lockedSubject)
                ->whereIn('estado', [
                    SolicitudAcceso::ESTADO_PENDIENTE,
                    SolicitudAcceso::ESTADO_ACEPTADA,
                ])
                ->exists();

            if ($hasCurrentRequest) {
                throw ValidationException::withMessages([
                    'materia' => 'Ya tienes una solicitud pendiente o aceptada para esta materia.',
                ]);
            }

            return SolicitudAcceso::query()->create([
                ...$data,
                'usuario_id' => $usuario->getKey(),
                'materia_id' => $lockedSubject->getKey(),
                'estado' => SolicitudAcceso::ESTADO_PENDIENTE,
                'fecha_solicitud' => now(),
            ]);
        });
    }

    public function respond(
        SolicitudAcceso $solicitud,
        User $docente,
        string $estado,
        ?string $motivo,
    ): SolicitudAcceso {
        return DB::transaction(function () use ($solicitud, $docente, $estado, $motivo): SolicitudAcceso {
            $lockedRequest = SolicitudAcceso::query()
                ->lockForUpdate()
                ->findOrFail($solicitud->getKey());

            if ($lockedRequest->estado !== SolicitudAcceso::ESTADO_PENDIENTE) {
                throw ValidationException::withMessages([
                    'estado' => 'Esta solicitud ya fue respondida.',
                ]);
            }

            $lockedRequest->update([
                'estado' => $estado,
                'motivo_respuesta' => $estado === SolicitudAcceso::ESTADO_RECHAZADA ? $motivo : null,
                'fecha_respuesta' => now(),
                'respondido_por' => $docente->getKey(),
            ]);

            if ($estado === SolicitudAcceso::ESTADO_ACEPTADA) {
                $this->accesoMateriaService->grant($lockedRequest);
            }

            return $lockedRequest->refresh();
        });
    }
}
