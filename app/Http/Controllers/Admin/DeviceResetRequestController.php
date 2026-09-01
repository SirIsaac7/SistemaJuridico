<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SolicitudReseteoDispositivo;
use App\Support\DateTimeFormatter;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DeviceResetRequestController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', SolicitudReseteoDispositivo::class);

        $status = in_array($request->string('status')->toString(), ['all', 'pendiente', 'aprobada'], true)
            ? $request->string('status')->toString()
            : 'pendiente';
        $search = trim($request->string('search')->toString());

        $requests = SolicitudReseteoDispositivo::query()
            ->with(['usuario:id,email', 'respondidoPor:id,email'])
            ->when($status !== 'all', fn ($query) => $query->where('estado', $status))
            ->when($search !== '', fn ($query) => $query->whereHas(
                'usuario',
                fn ($userQuery) => $userQuery->where('email', 'like', "%{$search}%")
            ))
            ->latest('created_at')
            ->latest('id')
            ->paginate(10)
            ->withQueryString();

        $requests->through(fn (SolicitudReseteoDispositivo $resetRequest): array => [
            'id' => $resetRequest->id,
            'email' => $resetRequest->usuario->email,
            'estado' => $resetRequest->estado,
            'created_at' => DateTimeFormatter::forDisplay($resetRequest->created_at),
            'fecha_respuesta' => DateTimeFormatter::forDisplay($resetRequest->fecha_respuesta),
            'can_approve' => $resetRequest->estado === SolicitudReseteoDispositivo::ESTADO_PENDIENTE
                && ! $request->user()->is($resetRequest->usuario)
                && Gate::allows('approve', $resetRequest),
        ]);

        return Inertia::render('admin/users/device-reset-requests', [
            'requests' => $requests,
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'counts' => [
                'all' => SolicitudReseteoDispositivo::count(),
                'pending' => SolicitudReseteoDispositivo::pendientes()->count(),
                'approved' => SolicitudReseteoDispositivo::query()
                    ->where('estado', SolicitudReseteoDispositivo::ESTADO_APROBADA)
                    ->count(),
            ],
        ]);
    }
}
