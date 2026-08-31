<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class SolicitudAcceso extends Model
{
    use HasFactory;

    protected $table = 'solicitudes_acceso';

    public const ESTADO_ACEPTADA = 'aceptada';

    public const ESTADO_PENDIENTE = 'pendiente';

    public const ESTADO_RECHAZADA = 'rechazada';

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'estado' => self::ESTADO_PENDIENTE,
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'usuario_id',
        'materia_id',
        'universidad',
        'observacion',
        'estado',
        'motivo_respuesta',
        'fecha_solicitud',
        'fecha_respuesta',
        'respondido_por',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'fecha_solicitud' => 'datetime',
            'fecha_respuesta' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    public function respondidoPor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'respondido_por');
    }

    public function accesoMateria(): HasOne
    {
        return $this->hasOne(AccesoMateria::class, 'solicitud_id');
    }

    #[Scope]
    protected function pendientes(Builder $query): Builder
    {
        return $query->where('estado', self::ESTADO_PENDIENTE);
    }

    #[Scope]
    protected function aceptadas(Builder $query): Builder
    {
        return $query->where('estado', self::ESTADO_ACEPTADA);
    }

    #[Scope]
    protected function rechazadas(Builder $query): Builder
    {
        return $query->where('estado', self::ESTADO_RECHAZADA);
    }

    #[Scope]
    protected function delUsuario(Builder $query, User $usuario): Builder
    {
        return $query->whereBelongsTo($usuario, 'usuario');
    }

    #[Scope]
    protected function paraDocente(Builder $query, User $docente): Builder
    {
        return $query->whereHas(
            'materia',
            fn (Builder $materias): Builder => $materias->whereBelongsTo($docente, 'docente'),
        );
    }
}
