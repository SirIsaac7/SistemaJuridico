<?php

namespace Database\Factories;

use App\Models\Materia;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Materia>
 */
class MateriaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'docente_id' => User::factory(),
            'nombre' => fake()->unique()->words(3, true),
            'descripcion' => fake()->optional()->paragraph(),
            'is_active' => true,
        ];
    }

    public function inactiva(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
