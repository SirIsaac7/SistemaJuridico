<?php

namespace App\Models;

use Database\Factories\DispositivoUsuarioFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DispositivoUsuario extends Model
{
    /** @use HasFactory<DispositivoUsuarioFactory> */
    use HasFactory;

    public const ESTADO_ACTIVO = 'activo';

    public const ESTADO_INACTIVO = 'inactivo';

    protected $table = 'dispositivos_usuario';

    protected $fillable = [
        'usuario_id',
        'device_token_hash',
        'tipo_dispositivo',
        'sistema_operativo',
        'navegador',
        'estado',
        'fecha_vinculacion',
        'ultimo_acceso',
    ];

    protected $hidden = [
        'device_token_hash',
    ];

    protected $attributes = [
        'estado' => self::ESTADO_ACTIVO,
    ];

    protected function casts(): array
    {
        return [
            'fecha_vinculacion' => 'datetime',
            'ultimo_acceso' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function scopeActivos(Builder $query): Builder
    {
        return $query->where('estado', self::ESTADO_ACTIVO);
    }
}
