<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Models\Archivo;
use App\Models\Materia;
use App\Services\Libros\ArchivoService;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArchivoContenidoController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Materia $materia,
        Archivo $archivo,
        ArchivoService $service,
    ): StreamedResponse {
        Gate::authorize('view', $archivo);

        return $service->inlineResponse($archivo);
    }
}
