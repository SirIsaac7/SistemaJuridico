<?php

namespace Database\Factories;

use App\Models\SolicitudReseteoDispositivo;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SolicitudReseteoDispositivo>
 */
class SolicitudReseteoDispositivoFactory extends Factory
{
    public function definition(): array
    {
        return [
            'usuario_id' => User::factory(),
            'estado' => SolicitudReseteoDispositivo::ESTADO_PENDIENTE,
            'respondido_por' => null,
            'fecha_respuesta' => null,
        ];
    }

    public function aprobada(?User $administrator = null): static
    {
        return $this->state(fn (): array => [
            'estado' => SolicitudReseteoDispositivo::ESTADO_APROBADA,
            'respondido_por' => $administrator?->id ?? User::factory(),
            'fecha_respuesta' => now(),
        ]);
    }
}
