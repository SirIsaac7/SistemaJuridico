<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Http\Requests\Libros\ResponderSolicitudAccesoRequest;
use App\Models\SolicitudAcceso;
use App\Services\Libros\SolicitudAccesoService;
use Illuminate\Http\RedirectResponse;

class SolicitudRespuestaController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        ResponderSolicitudAccesoRequest $request,
        SolicitudAcceso $solicitud,
        SolicitudAccesoService $service,
    ): RedirectResponse {
        $service->respond(
            $solicitud,
            $request->user(),
            $request->validated('estado'),
            $request->validated('motivo_respuesta'),
        );

        return back()->with('success', 'La solicitud fue respondida correctamente.');
    }
}
