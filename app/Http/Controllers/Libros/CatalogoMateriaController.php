<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Models\Materia;
use App\Models\SolicitudAcceso;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class CatalogoMateriaController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(Request $request): Response
    {
        Gate::authorize('viewCatalog', Materia::class);
        $usuario = $request->user();

        $materias = Materia::query()
            ->select(['id', 'docente_id', 'nombre', 'is_active'])
            ->activas()
            ->whereHas('docente', fn (Builder $query): Builder => $query->where('is_active', true))
            ->with(['docente:id,name'])
            ->withExists([
                'solicitudesAcceso as has_current_request' => fn (Builder $query): Builder => $query
                    ->whereBelongsTo($request->user(), 'usuario')
                    ->whereIn('estado', [
                        SolicitudAcceso::ESTADO_PENDIENTE,
                        SolicitudAcceso::ESTADO_ACEPTADA,
                    ]),
            ])
            ->orderBy('nombre')
            ->orderBy('id')
            ->get()
            ->map(fn (Materia $materia): array => [
                'id' => $materia->id,
                'nombre' => $materia->nombre,
                'docente' => [
                    'id' => $materia->docente->id,
                    'nombre_completo' => $materia->docente->name,
                ],
                'has_current_request' => $materia->has_current_request,
                'can_request' => Gate::forUser($usuario)
                    ->allows('create', [SolicitudAcceso::class, $materia]),
            ]);

        return Inertia::render('libros/catalogo/index', [
            'materias' => $materias,
        ]);
    }
}
