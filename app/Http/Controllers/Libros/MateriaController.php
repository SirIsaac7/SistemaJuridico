<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Http\Requests\Libros\IndexMateriaRequest;
use App\Http\Requests\Libros\StoreMateriaRequest;
use App\Http\Requests\Libros\UpdateMateriaRequest;
use App\Models\Archivo;
use App\Models\Materia;
use App\Services\Libros\MateriaService;
use App\Support\DateTimeFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MateriaController extends Controller
{
    public function index(IndexMateriaRequest $request): Response
    {
        $estado = $request->validated('estado', 'activas');
        $materias = Materia::query()
            ->delDocente($request->user())
            ->when($estado === 'activas', fn (Builder $query): Builder => $query->activas())
            ->when($estado === 'inactivas', fn (Builder $query): Builder => $query->inactivas())
            ->withCount([
                'archivos',
                'archivos as archivos_activos_count' => fn (Builder $query): Builder => $query->activos(),
                'solicitudesAcceso as solicitudes_pendientes_count' => fn (Builder $query): Builder => $query->pendientes(),
            ])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Materia $materia): array => [
                'id' => $materia->id,
                'nombre' => $materia->nombre,
                'descripcion' => $materia->descripcion,
                'is_active' => $materia->is_active,
                'archivos_count' => $materia->archivos_count,
                'archivos_activos_count' => $materia->archivos_activos_count,
                'solicitudes_pendientes_count' => $materia->solicitudes_pendientes_count,
                'created_at' => DateTimeFormatter::forDisplay($materia->created_at),
                'can' => [
                    'update' => Gate::allows('update', $materia),
                    'update_status' => Gate::allows('updateStatus', $materia),
                ],
            ]);

        return Inertia::render('libros/docente/materias/index', [
            'materias' => $materias,
            'filters' => ['estado' => $estado],
            'can' => ['create' => Gate::allows('create', Materia::class)],
        ]);
    }

    public function store(StoreMateriaRequest $request, MateriaService $service): RedirectResponse
    {
        $service->create($request->user(), $request->validated());

        return back()->with('success', 'La materia fue creada correctamente.');
    }

    public function show(Materia $materia): Response
    {
        Gate::authorize('view', $materia);

        $materia->load([
            'archivos' => fn ($query) => $query
                ->orderByDesc('created_at')
                ->orderByDesc('id'),
        ]);

        return Inertia::render('libros/docente/materias/show', [
            'materia' => [
                'id' => $materia->id,
                'nombre' => $materia->nombre,
                'descripcion' => $materia->descripcion,
                'is_active' => $materia->is_active,
                'archivos' => $materia->archivos->map(fn (Archivo $archivo): array => [
                    'id' => $archivo->id,
                    'titulo' => $archivo->titulo,
                    'descripcion' => $archivo->descripcion,
                    'nombre_original' => $archivo->nombre_original,
                    'tipo' => $archivo->tipo,
                    'mime_type' => $archivo->mime_type,
                    'extension' => $archivo->extension,
                    'tamano_bytes' => $archivo->tamano_bytes,
                    'is_active' => $archivo->is_active,
                    'created_at' => DateTimeFormatter::forDisplay($archivo->created_at),
                    'can' => [
                        'view' => Gate::allows('view', $archivo),
                        'update' => Gate::allows('update', $archivo),
                        'update_status' => Gate::allows('updateStatus', $archivo),
                    ],
                ]),
            ],
            'can' => [
                'upload_file' => Gate::allows('create', [Archivo::class, $materia]),
                'update' => Gate::allows('update', $materia),
                'update_status' => Gate::allows('updateStatus', $materia),
            ],
        ]);
    }

    public function update(
        UpdateMateriaRequest $request,
        Materia $materia,
        MateriaService $service,
    ): RedirectResponse {
        $service->update($materia, $request->validated());

        return back()->with('success', 'La materia fue actualizada correctamente.');
    }
}
