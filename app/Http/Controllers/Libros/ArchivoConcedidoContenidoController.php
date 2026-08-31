<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Models\Archivo;
use App\Models\Materia;
use App\Services\Libros\ArchivoConcedidoAccessService;
use App\Services\Libros\ProtectedFileResponseService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ArchivoConcedidoContenidoController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        Request $request,
        Materia $materia,
        Archivo $archivo,
        ArchivoConcedidoAccessService $accessService,
        ProtectedFileResponseService $responseService,
    ): Response {
        $user = $request->user();
        $accessService->authorize($user, $materia, $archivo);

        return $responseService->make($request, $archivo);
    }
}
