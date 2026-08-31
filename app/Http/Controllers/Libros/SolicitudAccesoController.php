<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Http\Requests\Libros\IndexSolicitudAccesoRequest;
use App\Http\Requests\Libros\StoreSolicitudAccesoRequest;
use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Services\Libros\SolicitudAccesoService;
use App\Support\DateTimeFormatter;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SolicitudAccesoController extends Controller
{
    public function index(IndexSolicitudAccesoRequest $request): Response
    {
        $estado = $request->validated('estado');
        $solicitudes = SolicitudAcceso::query()
            ->delUsuario($request->user())
            ->when($estado, fn (Builder $query, string $estado): Builder => $query->where('estado', $estado))
            ->with(['materia:id,docente_id,nombre', 'materia.docente:id,name', 'respondidoPor:id,name'])
            ->orderByDesc('fecha_solicitud')
            ->orderByDesc('id')
            ->get()
            ->map(fn (SolicitudAcceso $solicitud): array => [
                'id' => $solicitud->id,
                'materia' => [
                    'id' => $solicitud->materia->id,
                    'nombre' => $solicitud->materia->nombre,
                    'docente' => $solicitud->materia->docente->name,
                ],
                'universidad' => $solicitud->universidad,
                'observacion' => $solicitud->observacion,
                'estado' => $solicitud->estado,
                'motivo_respuesta' => $solicitud->motivo_respuesta,
                'fecha_solicitud' => DateTimeFormatter::forDisplay($solicitud->fecha_solicitud),
                'fecha_respuesta' => DateTimeFormatter::forDisplay($solicitud->fecha_respuesta),
                'respondido_por' => $solicitud->respondidoPor?->name,
            ]);

        return Inertia::render('libros/solicitudes/index', [
            'solicitudes' => $solicitudes,
            'filters' => ['estado' => $estado],
        ]);
    }

    public function store(
        StoreSolicitudAccesoRequest $request,
        Materia $materia,
        SolicitudAccesoService $service,
    ): RedirectResponse {
        $service->create($request->user(), $materia, $request->validated());

        return back()->with('success', 'La solicitud fue enviada al docente.');
    }
}
