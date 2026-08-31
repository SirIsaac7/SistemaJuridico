<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Models\AccesoMateria;
use App\Models\Archivo;
use App\Models\Materia;
use App\Support\DateTimeFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MateriaConcedidaController extends Controller
{
    public function show(Request $request, Materia $materia): Response
    {
        $acceso = AccesoMateria::query()
            ->delUsuario($request->user())
            ->deMateria($materia)
            ->with('materia')
            ->first();

        abort_unless($acceso, 403);
        Gate::authorize('view', $acceso);

        $materia->load([
            'docente:id,name',
            'archivos' => fn ($archivos) => $archivos
                ->activos()
                ->whereIn('tipo', Archivo::TIPOS_VISUALIZABLES)
                ->orderByDesc('created_at')
                ->orderByDesc('id'),
        ]);

        return Inertia::render('libros/estudiante/materias/show', [
            'materia' => [
                'id' => $materia->id,
                'nombre' => $materia->nombre,
                'descripcion' => $materia->descripcion,
                'docente' => $materia->docente->name,
                'fecha_inicio' => DateTimeFormatter::forDisplay($acceso->fecha_inicio),
                'fecha_fin' => DateTimeFormatter::forDisplay($acceso->fecha_fin),
                'archivos' => $materia->archivos->map(fn (Archivo $archivo): array => [
                    'id' => $archivo->id,
                    'titulo' => $archivo->titulo,
                    'descripcion' => $archivo->descripcion,
                    'nombre_original' => $archivo->nombre_original,
                    'tipo' => $archivo->tipo,
                    'mime_type' => $archivo->mime_type,
                    'extension' => $archivo->extension,
                    'tamano_bytes' => $archivo->tamano_bytes,
                    'created_at' => DateTimeFormatter::forDisplay($archivo->created_at),
                ]),
            ],
        ]);
    }
}
