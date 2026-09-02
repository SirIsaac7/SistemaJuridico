<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Http\Requests\Libros\StoreMateriaRequest;
use App\Http\Requests\Libros\UpdateMateriaRequest;
use App\Models\AccesoMateria;
use App\Models\Archivo;
use App\Models\Materia;
use App\Services\Libros\MateriaAccessService;
use App\Services\Libros\MateriaService;
use App\Support\DateTimeFormatter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class MateriaController extends Controller
{
    public function store(StoreMateriaRequest $request, MateriaService $service): RedirectResponse
    {
        $service->create($request->user(), $request->validated());

        return back()->with('success', 'La materia fue creada correctamente.');
    }

    public function show(
        Request $request,
        Materia $materia,
        MateriaAccessService $accessService,
    ): Response {
        $user = $request->user();
        $context = $accessService->resolve($user, $materia);
        $canManage = $context['can_manage'];
        $canSupervise = $context['can_supervise'];
        /** @var AccesoMateria|null $access */
        $access = $context['access'];

        $materia->load([
            'docente:id,name,email',
            'archivos' => fn ($query) => $query
                ->when(! $canManage && ! $canSupervise, fn ($files) => $files
                    ->activos()
                    ->whereIn('tipo', Archivo::TIPOS_VISUALIZABLES))
                ->orderByDesc('created_at')
                ->orderByDesc('id'),
        ]);

        if ($canSupervise) {
            $materia->load([
                'accesosConcedidos' => fn ($query) => $query
                    ->with(['usuario:id,name,email', 'solicitud:id,universidad'])
                    ->orderByDesc('fecha_inicio')
                    ->orderByDesc('id'),
            ]);
        }

        return Inertia::render('libros/materias/show', [
            'materia' => [
                'id' => $materia->id,
                'nombre' => $materia->nombre,
                'descripcion' => $materia->descripcion,
                'is_active' => $materia->is_active,
                'created_at' => DateTimeFormatter::forDisplay($materia->created_at),
                'docente' => [
                    'id' => $materia->docente->id,
                    'nombre' => $materia->docente->name,
                    'email' => $materia->docente->email,
                ],
                'access' => $access ? [
                    'fecha_inicio' => DateTimeFormatter::forDisplay($access->fecha_inicio),
                    'fecha_fin' => DateTimeFormatter::forDisplay($access->fecha_fin),
                ] : null,
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
                    'view_url' => $canManage
                        ? route('libros.materias.archivos.contenido', [$materia, $archivo])
                        : ($canSupervise
                            ? route('libros.administracion.materias.archivos.contenido', [$materia, $archivo])
                            : route('libros.mis-materias.archivos.visor', [$materia, $archivo])),
                    'can' => [
                        'view' => true,
                        'update' => $canManage && Gate::forUser($user)->allows('update', $archivo),
                        'update_status' => $canManage && Gate::forUser($user)->allows('updateStatus', $archivo),
                    ],
                ]),
                'students' => $canSupervise
                    ? $materia->accesosConcedidos->map(fn (AccesoMateria $studentAccess): array => [
                        'id' => $studentAccess->id,
                        'estudiante' => [
                            'id' => $studentAccess->usuario->id,
                            'nombre' => $studentAccess->usuario->name,
                            'email' => $studentAccess->usuario->email,
                        ],
                        'universidad' => $studentAccess->solicitud->universidad,
                        'is_current' => $studentAccess->is_active
                            && ($studentAccess->fecha_fin === null || $studentAccess->fecha_fin->isFuture())
                            && $materia->is_active,
                        'fecha_inicio' => DateTimeFormatter::forDisplay($studentAccess->fecha_inicio),
                        'fecha_fin' => DateTimeFormatter::forDisplay($studentAccess->fecha_fin),
                    ])
                    : null,
            ],
            'context' => [
                'can_supervise' => $canSupervise,
                'can_manage' => $canManage,
                'has_granted_access' => $access !== null,
            ],
            'can' => [
                'upload_file' => $canManage && Gate::forUser($user)->allows('create', [Archivo::class, $materia]),
                'update' => $canManage && Gate::forUser($user)->allows('update', $materia),
                'update_status' => $canManage && Gate::forUser($user)->allows('updateStatus', $materia),
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
