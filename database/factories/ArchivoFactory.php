<?php

namespace Database\Factories;

use App\Models\Archivo;
use App\Models\Materia;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Archivo>
 */
class ArchivoFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $uuid = Str::uuid()->toString();

        return [
            'materia_id' => Materia::factory(),
            'titulo' => fake()->sentence(4),
            'descripcion' => fake()->optional()->paragraph(),
            'nombre_original' => "{$uuid}.pdf",
            'tipo' => Archivo::TIPO_PDF,
            'mime_type' => 'application/pdf',
            'extension' => 'pdf',
            'disk' => 'local',
            'ruta' => "libros/pruebas/{$uuid}.pdf",
            'tamano_bytes' => fake()->numberBetween(1024, 10485760),
            'is_active' => true,
        ];
    }

    public function inactivo(): static
    {
        return $this->state(fn (array $attributes): array => [
            'is_active' => false,
        ]);
    }
}
