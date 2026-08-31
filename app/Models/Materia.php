<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Materia extends Model
{
    use HasFactory;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
    ];

    /**
     * @var list<string>
     */
    protected $fillable = [
        'docente_id',
        'nombre',
        'descripcion',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function docente(): BelongsTo
    {
        return $this->belongsTo(User::class, 'docente_id');
    }

    public function archivos(): HasMany
    {
        return $this->hasMany(Archivo::class);
    }

    public function solicitudesAcceso(): HasMany
    {
        return $this->hasMany(SolicitudAcceso::class);
    }

    public function accesosConcedidos(): HasMany
    {
        return $this->hasMany(AccesoMateria::class);
    }

    #[Scope]
    protected function activas(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    #[Scope]
    protected function inactivas(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    #[Scope]
    protected function delDocente(Builder $query, User $docente): Builder
    {
        return $query->whereBelongsTo($docente, 'docente');
    }
}
