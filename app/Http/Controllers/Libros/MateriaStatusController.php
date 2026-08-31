<?php

namespace App\Http\Controllers\Libros;

use App\Http\Controllers\Controller;
use App\Http\Requests\Libros\UpdateMateriaStatusRequest;
use App\Models\Materia;
use App\Services\Libros\MateriaService;
use Illuminate\Http\RedirectResponse;

class MateriaStatusController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(
        UpdateMateriaStatusRequest $request,
        Materia $materia,
        MateriaService $service,
    ): RedirectResponse {
        $isActive = $request->boolean('is_active');
        $service->updateStatus($materia, $isActive);

        return back()->with(
            'success',
            $isActive ? 'La materia fue reactivada.' : 'La materia fue inhabilitada.',
        );
    }
}
