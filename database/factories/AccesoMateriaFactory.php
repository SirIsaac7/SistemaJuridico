<?php

namespace Database\Factories;

use App\Models\AccesoMateria;
use App\Models\SolicitudAcceso;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AccesoMateria>
 */
class AccesoMateriaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'solicitud_id' => SolicitudAcceso::factory()->aceptada(),
            'usuario_id' => fn (array $attributes): int => SolicitudAcceso::query()
                ->findOrFail($attributes['solicitud_id'])
                ->usuario_id,
            'materia_id' => fn (array $attributes): int => SolicitudAcceso::query()
                ->findOrFail($attributes['solicitud_id'])
                ->materia_id,
            'fecha_inicio' => now(),
            'fecha_fin' => null,
            'is_active' => true,
        ];
    }

    public function inactivo(): static
    {
        return $this->state(fn (array $attributes): array => ['is_active' => false]);
    }

    public function vencido(): static
    {
        return $this->state(fn (array $attributes): array => [
            'fecha_inicio' => now()->subMonths(2),
            'fecha_fin' => now()->subMonth(),
        ]);
    }
}
