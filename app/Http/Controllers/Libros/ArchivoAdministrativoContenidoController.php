<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Models\Archivo;
use App\Models\Materia;
use App\Services\Libros\ArchivoService;
use Illuminate\Support\Facades\Gate;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArchivoAdministrativoContenidoController extends Controller
{
    public function __invoke(
        Materia $materia,
        Archivo $archivo,
        ArchivoService $service,
    ): StreamedResponse {
        Gate::authorize('viewAdministrative', $archivo);

        return $service->inlineResponse($archivo);
    }
}
