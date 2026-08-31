<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Archivo extends Model
{
    use HasFactory;

    public const TIPO_DOCUMENTO = 'documento';

    public const TIPO_FLUJOGRAMA = 'flujograma';

    public const TIPO_IMAGEN = 'imagen';

    public const TIPO_OTRO = 'otro';

    public const TIPO_PDF = 'pdf';

    public const TIPO_VIDEO = 'video';

    public const TIPOS = [
        self::TIPO_PDF,
        self::TIPO_VIDEO,
        self::TIPO_IMAGEN,
        self::TIPO_FLUJOGRAMA,
        self::TIPO_DOCUMENTO,
        self::TIPO_OTRO,
    ];

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
        'materia_id',
        'titulo',
        'descripcion',
        'nombre_original',
        'tipo',
        'mime_type',
        'extension',
        'disk',
        'ruta',
        'tamano_bytes',
        'is_active',
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'tamano_bytes' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function materia(): BelongsTo
    {
        return $this->belongsTo(Materia::class);
    }

    #[Scope]
    protected function activos(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    #[Scope]
    protected function inactivos(Builder $query): Builder
    {
        return $query->where('is_active', false);
    }

    #[Scope]
    protected function deMateria(Builder $query, Materia $materia): Builder
    {
        return $query->whereBelongsTo($materia);
    }
}
