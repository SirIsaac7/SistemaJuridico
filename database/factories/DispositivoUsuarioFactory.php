<?php

namespace Database\Factories;

use App\Models\DispositivoUsuario;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DispositivoUsuario>
 */
class DispositivoUsuarioFactory extends Factory
{
    public function definition(): array
    {
        return [
            'usuario_id' => User::factory(),
            'device_token_hash' => hash('sha256', fake()->uuid()),
            'tipo_dispositivo' => 'PC/Laptop',
            'sistema_operativo' => 'Windows 11',
            'navegador' => 'Chrome',
            'estado' => DispositivoUsuario::ESTADO_ACTIVO,
            'fecha_vinculacion' => now(),
            'ultimo_acceso' => now(),
        ];
    }

    public function inactivo(): static
    {
        return $this->state(fn (): array => [
            'estado' => DispositivoUsuario::ESTADO_INACTIVO,
        ]);
    }
}
