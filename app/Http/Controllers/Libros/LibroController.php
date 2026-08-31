<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Models\AccesoMateria;
use App\Support\DateTimeFormatter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LibroController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->can('libros.ver'), 403);

        $materias = collect();

        if ($request->user()->can('libros.accesos.ver-propios')) {
            $materias = AccesoMateria::query()
                ->delUsuario($request->user())
                ->vigentes()
                ->with([
                    'materia' => fn ($materias) => $materias
                        ->with('docente:id,name')
                        ->withCount([
                            'archivos as archivos_activos_count' => fn ($archivos) => $archivos->activos(),
                        ]),
                ])
                ->orderByDesc('fecha_inicio')
                ->orderByDesc('id')
                ->get()
                ->map(fn (AccesoMateria $acceso): array => [
                    'id' => $acceso->materia->id,
                    'nombre' => $acceso->materia->nombre,
                    'docente' => $acceso->materia->docente->name,
                    'archivos_count' => $acceso->materia->archivos_activos_count,
                    'fecha_inicio' => DateTimeFormatter::forDisplay($acceso->fecha_inicio),
                    'fecha_fin' => DateTimeFormatter::forDisplay($acceso->fecha_fin),
                ]);
        }

        return Inertia::render('libros/index', [
            'materias' => $materias,
            'can' => [
                'manage_subjects' => $request->user()->can('libros.materias.ver'),
                'view_catalog' => $request->user()->can('libros.catalogo.ver'),
                'view_own_requests' => $request->user()->can('libros.solicitudes.ver-propias'),
                'view_received_requests' => $request->user()->can('libros.solicitudes.ver-recibidas'),
                'view_granted_subjects' => $request->user()->can('libros.accesos.ver-propios'),
            ],
        ]);
    }
}
