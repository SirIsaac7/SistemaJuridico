<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Http\Requests\Libros\IndexSolicitudRecibidaRequest;
use App\Models\SolicitudAcceso;
use App\Support\DateTimeFormatter;
use Illuminate\Database\Eloquent\Builder;
use Inertia\Inertia;
use Inertia\Response;

class SolicitudRecibidaController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(IndexSolicitudRecibidaRequest $request): Response
    {
        $estado = $request->validated('estado');
        $solicitudes = SolicitudAcceso::query()
            ->paraDocente($request->user())
            ->when($estado, fn (Builder $query, string $estado): Builder => $query->where('estado', $estado))
            ->with(['usuario:id,name,email', 'materia:id,docente_id,nombre'])
            ->orderByDesc('fecha_solicitud')
            ->orderByDesc('id')
            ->get()
            ->map(fn (SolicitudAcceso $solicitud): array => [
                'id' => $solicitud->id,
                'estudiante' => [
                    'id' => $solicitud->usuario->id,
                    'nombre_completo' => $solicitud->usuario->name,
                    'email' => $solicitud->usuario->email,
                ],
                'materia' => [
                    'id' => $solicitud->materia->id,
                    'nombre' => $solicitud->materia->nombre,
                ],
                'universidad' => $solicitud->universidad,
                'observacion' => $solicitud->observacion,
                'estado' => $solicitud->estado,
                'motivo_respuesta' => $solicitud->motivo_respuesta,
                'fecha_solicitud' => DateTimeFormatter::forDisplay($solicitud->fecha_solicitud),
                'fecha_respuesta' => DateTimeFormatter::forDisplay($solicitud->fecha_respuesta),
            ]);

        return Inertia::render('libros/docente/solicitudes/index', [
            'solicitudes' => $solicitudes,
            'filters' => ['estado' => $estado],
        ]);
    }
}
