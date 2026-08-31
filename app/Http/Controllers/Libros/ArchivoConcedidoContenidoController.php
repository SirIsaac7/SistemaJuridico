<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Models\AccesoMateria;
use App\Models\Archivo;
use App\Models\Materia;
use App\Services\Libros\ArchivoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArchivoConcedidoContenidoController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        Materia $materia,
        Archivo $archivo,
        ArchivoService $service,
    ): StreamedResponse {
        $acceso = AccesoMateria::query()
            ->delUsuario($request->user())
            ->deMateria($materia)
            ->with('materia')
            ->first();

        abort_unless($acceso, 403);
        Gate::authorize('view', $acceso);
        abort_unless($archivo->is_active, 404);

        return $service->inlineResponse($archivo);
    }
}
