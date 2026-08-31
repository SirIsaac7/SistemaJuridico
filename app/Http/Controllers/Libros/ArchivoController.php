<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Http\Requests\Libros\StoreArchivoRequest;
use App\Http\Requests\Libros\UpdateArchivoRequest;
use App\Models\Archivo;
use App\Models\Materia;
use App\Services\Libros\ArchivoService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\UploadedFile;

class ArchivoController extends Controller
{
    public function store(
        StoreArchivoRequest $request,
        Materia $materia,
        ArchivoService $service,
    ): RedirectResponse {
        $uploadedFile = $request->file('archivo');

        abort_unless($uploadedFile instanceof UploadedFile, 422);

        $service->create(
            $request->user(),
            $materia,
            $uploadedFile,
            $request->safe()->only(['titulo', 'descripcion', 'tipo']),
        );

        return back()->with('success', 'El archivo fue cargado correctamente.');
    }

    public function update(
        UpdateArchivoRequest $request,
        Materia $materia,
        Archivo $archivo,
        ArchivoService $service,
    ): RedirectResponse {
        $service->update(
            $archivo,
            $request->safe()->only(['titulo', 'descripcion']),
        );

        return back()->with('success', 'La información del archivo fue actualizada.');
    }
}
