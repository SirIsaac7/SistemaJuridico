<?php

namespace Database\Factories;

use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SolicitudAcceso>
 */
class SolicitudAccesoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'usuario_id' => User::factory(),
            'materia_id' => Materia::factory(),
            'universidad' => fake()->company(),
            'observacion' => fake()->optional()->sentence(),
            'estado' => SolicitudAcceso::ESTADO_PENDIENTE,
            'motivo_respuesta' => null,
            'fecha_solicitud' => now(),
            'fecha_respuesta' => null,
            'respondido_por' => null,
        ];
    }

    public function aceptada(?User $docente = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'estado' => SolicitudAcceso::ESTADO_ACEPTADA,
            'fecha_respuesta' => now(),
            'respondido_por' => $docente?->id ?? User::factory(),
        ]);
    }

    public function rechazada(?User $docente = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'estado' => SolicitudAcceso::ESTADO_RECHAZADA,
            'motivo_respuesta' => 'La solicitud no cumple los requisitos.',
            'fecha_respuesta' => now(),
            'respondido_por' => $docente?->id ?? User::factory(),
        ]);
    }
}
