<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Http\Requests\Libros\IndexLibroRequest;
use App\Models\AccesoMateria;
use App\Models\Materia;
use App\Models\User;
use App\Support\DateTimeFormatter;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class LibroController extends Controller
{
    public function index(IndexLibroRequest $request): Response
    {
        $user = $request->user();
        $canSupervise = $user->can('libros.administracion.ver');
        $canManage = $user->can('libros.materias.ver');
        $canViewGranted = $user->can('libros.accesos.ver-propios');
        $canCreateForTeacher = $user->can('libros.materias.crear-para-docente');
        $ambito = $request->validated('ambito', 'todas');
        $estado = $request->validated('estado', 'todas');
        $buscar = trim((string) $request->validated('buscar', ''));

        $materias = Materia::query()
            ->with([
                'docente:id,name,email',
                'accesosConcedidos' => fn ($query) => $query
                    ->where('usuario_id', $user->getKey())
                    ->where('is_active', true)
                    ->where(fn ($fechas) => $fechas
                        ->whereNull('fecha_fin')
                        ->orWhere('fecha_fin', '>', now())),
            ])
            ->withCount([
                'archivos',
                'archivos as archivos_activos_count' => fn ($query) => $query->activos(),
                'solicitudesAcceso as solicitudes_pendientes_count' => fn ($query) => $query->pendientes(),
                'accesosConcedidos as estudiantes_activos_count' => fn ($query) => $query
                    ->where('is_active', true)
                    ->where(fn ($fechas) => $fechas
                        ->whereNull('fecha_fin')
                        ->orWhere('fecha_fin', '>', now())),
            ])
            ->when($ambito === 'impartidas', function (Builder $query) use ($canManage, $user): void {
                $canManage
                    ? $query->whereBelongsTo($user, 'docente')
                    : $query->whereKey([]);
            })
            ->when($ambito === 'concedidas', function (Builder $query) use ($canViewGranted, $user): void {
                $canViewGranted
                    ? $this->whereGrantedTo($query, $user)
                    : $query->whereKey([]);
            })
            ->when($ambito === 'todas' && ! $canSupervise, function (Builder $query) use ($canManage, $canViewGranted, $user): void {
                $query->where(function (Builder $visible) use ($canManage, $canViewGranted, $user): void {
                    if ($canManage) {
                        $visible->orWhereBelongsTo($user, 'docente');
                    }

                    if ($canViewGranted) {
                        $visible->orWhere(fn (Builder $granted): Builder => $this->whereGrantedTo($granted, $user));
                    }

                    if (! $canManage && ! $canViewGranted) {
                        $visible->whereKey([]);
                    }
                });
            })
            ->when($estado === 'activas', fn (Builder $query): Builder => $query->activas())
            ->when($estado === 'inactivas', fn (Builder $query): Builder => $query->inactivas())
            ->when($buscar !== '', fn (Builder $query): Builder => $query->where(
                fn (Builder $search): Builder => $search
                    ->where('nombre', 'like', "%{$buscar}%")
                    ->orWhereHas('docente', fn (Builder $docentes): Builder => $docentes
                        ->where('name', 'like', "%{$buscar}%")
                        ->orWhere('email', 'like', "%{$buscar}%")),
            ))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(function (Materia $materia) use ($canManage, $canSupervise, $user): array {
                /** @var AccesoMateria|null $access */
                $access = $materia->accesosConcedidos->first();
                $isOwner = (int) $materia->docente_id === (int) $user->getKey();
                $canManageMatter = $canManage && $isOwner;
                $canSeeInternalCounts = $canSupervise || $canManageMatter;

                return [
                    'id' => $materia->id,
                    'nombre' => $materia->nombre,
                    'descripcion' => $materia->descripcion,
                    'is_active' => $materia->is_active,
                    'docente' => [
                        'id' => $materia->docente->id,
                        'nombre' => $materia->docente->name,
                        'email' => $materia->docente->email,
                    ],
                    'archivos_count' => $canSeeInternalCounts
                        ? $materia->archivos_count
                        : $materia->archivos_activos_count,
                    'archivos_activos_count' => $materia->archivos_activos_count,
                    'solicitudes_pendientes_count' => $canManageMatter
                        ? $materia->solicitudes_pendientes_count
                        : 0,
                    'estudiantes_activos_count' => $canSupervise
                        ? $materia->estudiantes_activos_count
                        : 0,
                    'fecha_inicio' => DateTimeFormatter::forDisplay($access?->fecha_inicio),
                    'fecha_fin' => DateTimeFormatter::forDisplay($access?->fecha_fin),
                    'created_at' => DateTimeFormatter::forDisplay($materia->created_at),
                    'context' => [
                        'can_supervise' => $canSupervise,
                        'can_manage' => $canManageMatter,
                        'has_granted_access' => $access !== null && $materia->is_active,
                    ],
                ];
            });

        return Inertia::render('libros/index', [
            'materias' => $materias,
            'filters' => compact('ambito', 'buscar', 'estado'),
            'can' => [
                'create_own_subject' => $user->can('libros.materias.crear'),
                'create_for_teacher' => $canCreateForTeacher,
                'manage_subjects' => $canManage,
                'supervise' => $canSupervise,
                'view_catalog' => $user->can('libros.catalogo.ver'),
                'view_own_requests' => $user->can('libros.solicitudes.ver-propias'),
                'view_received_requests' => $user->can('libros.solicitudes.ver-recibidas'),
                'view_granted_subjects' => $canViewGranted,
            ],
            'docentes' => $canCreateForTeacher
                ? User::query()
                    ->select(['id', 'name', 'email'])
                    ->where('is_active', true)
                    ->whereHas('roles', fn (Builder $roles): Builder => $roles
                        ->where('name', config('access_control.docente_role'))
                        ->where('guard_name', 'web'))
                    ->orderBy('name')
                    ->orderBy('id')
                    ->get()
                : [],
        ]);
    }

    private function whereGrantedTo(Builder $query, User $user): Builder
    {
        return $query
            ->activas()
            ->whereHas('accesosConcedidos', fn (Builder $accesses): Builder => $accesses
                ->whereBelongsTo($user, 'usuario')
                ->where('is_active', true)
                ->where(fn (Builder $dates): Builder => $dates
                    ->whereNull('fecha_fin')
                    ->orWhere('fecha_fin', '>', now())));
    }
}
