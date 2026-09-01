<?php

namespace App\Models;

use Database\Factories\SolicitudReseteoDispositivoFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SolicitudReseteoDispositivo extends Model
{
    /** @use HasFactory<SolicitudReseteoDispositivoFactory> */
    use HasFactory;

    public const ESTADO_PENDIENTE = 'pendiente';

    public const ESTADO_APROBADA = 'aprobada';

    protected $table = 'solicitudes_reseteo_dispositivo';

    protected $fillable = [
        'usuario_id',
        'estado',
        'respondido_por',
        'fecha_respuesta',
    ];

    protected $attributes = [
        'estado' => self::ESTADO_PENDIENTE,
    ];

    protected function casts(): array
    {
        return [
            'fecha_respuesta' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function respondidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'respondido_por');
    }

    public function scopePendientes(Builder $query): Builder
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }
}
