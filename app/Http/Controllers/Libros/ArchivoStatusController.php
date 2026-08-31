<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Http\Requests\Libros\UpdateArchivoStatusRequest;
use App\Models\Archivo;
use App\Models\Materia;
use App\Services\Libros\ArchivoService;
use Illuminate\Http\RedirectResponse;

class ArchivoStatusController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        UpdateArchivoStatusRequest $request,
        Materia $materia,
        Archivo $archivo,
        ArchivoService $service,
    ): RedirectResponse {
        $isActive = $request->boolean('is_active');
        $service->updateStatus($archivo, $isActive);

        return back()->with(
            'success',
            $isActive ? 'El archivo fue reactivado.' : 'El archivo fue inhabilitado.',
        );
    }
}
