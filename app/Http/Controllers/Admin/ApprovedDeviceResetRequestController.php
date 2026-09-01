<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SolicitudReseteoDispositivo;
use App\Services\Auth\DeviceResetRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class ApprovedDeviceResetRequestController extends Controller
{
    public function store(
        Request $request,
        SolicitudReseteoDispositivo $solicitudReseteoDispositivo,
        DeviceResetRequestService $resetRequests,
    ): RedirectResponse {
        Gate::authorize('approve', $solicitudReseteoDispositivo);

        abort_if($request->user()->is($solicitudReseteoDispositivo->usuario), 403);

        $resetRequests->approve($solicitudReseteoDispositivo, $request->user());

        return back()->with('success', 'La solicitud fue aprobada y el dispositivo anterior quedó desvinculado.');
    }
}
