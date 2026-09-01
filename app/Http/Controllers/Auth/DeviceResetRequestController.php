<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Services\Auth\DeviceResetRequestService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class DeviceResetRequestController extends Controller
{
    public function store(Request $request, DeviceResetRequestService $resetRequests): RedirectResponse
    {
        $resetRequests->createFromChallenge($request);

        return back()->with('status', 'Tu solicitud fue enviada. Un administrador revisará el reseteo de tu dispositivo.');
    }
}
