<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Models\Archivo;
use App\Models\Materia;
use App\Services\Libros\ArchivoConcedidoAccessService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArchivoConcedidoVisorController extends Controller
{
    public function __invoke(
        Request $request,
        Materia $materia,
        Archivo $archivo,
        ArchivoConcedidoAccessService $accessService,
    ): Response {
        $user = $request->user();
        $accessService->authorize($user, $materia, $archivo);

        return Inertia::render('libros/estudiante/archivos/visor', [
            'materia' => [
                'id' => $materia->id,
                'nombre' => $materia->nombre,
            ],
            'archivo' => [
                'id' => $archivo->id,
                'titulo' => $archivo->titulo,
                'tipo' => $archivo->tipo,
                'mime_type' => $archivo->mime_type,
                'contenido_url' => route('libros.mis-materias.archivos.contenido', [$materia, $archivo]),
            ],
        ]);
    }
}
