<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Http\Requests\Libros\StoreMateriaDocenteRequest;
use App\Models\User;
use App\Services\Libros\MateriaService;
use Illuminate\Http\RedirectResponse;

class MateriaDocenteController extends Controller
{
    public function store(
        StoreMateriaDocenteRequest $request,
        MateriaService $service,
    ): RedirectResponse {
        $docente = User::query()->findOrFail($request->integer('docente_id'));
        $service->create($docente, $request->safe()->only(['nombre', 'descripcion']));

        return back()->with('success', 'La materia fue creada y asignada al docente correctamente.');
    }
}
