<?php

namespace App\Models;

use Database\Factories\AccesoMateriaFactory;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AccesoMateria extends Model
{
    /** @use HasFactory<AccesoMateriaFactory> */
    use HasFactory;

    protected $table = 'accesos_materias';

    /** @var array<string, mixed> */
    protected $attributes = [
        'is_active' => true,
    ];

    /** @var list<string> */
    protected $fillable = [
        'usuario_id',
        'materia_id',
        'solicitud_id',
        'fecha_inicio',
        'fecha_fin',
        'is_active',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'fecha_inicio' => 'datetime',
            'fecha_fin' => 'datetime',
            'is_active' => 'boolean',
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

    public function solicitud(): BelongsTo
    {
        return $this->belongsTo(SolicitudAcceso::class, 'solicitud_id');
    }

    #[Scope]
    protected function delUsuario(Builder $query, User $usuario): Builder
    {
        return $query->whereBelongsTo($usuario, 'usuario');
    }

    #[Scope]
    protected function deMateria(Builder $query, Materia $materia): Builder
    {
        return $query->whereBelongsTo($materia);
    }

    #[Scope]
    protected function vigentes(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where(function (Builder $fechas): void {
                $fechas->whereNull('fecha_fin')->orWhere('fecha_fin', '>', now());
            })
            ->whereHas('materia', fn (Builder $materias): Builder => $materias->activas());
    }
}
