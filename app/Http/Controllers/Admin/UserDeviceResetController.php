<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\DeviceAccessService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class UserDeviceResetController extends Controller
{
    public function __invoke(User $user, DeviceAccessService $deviceAccess): RedirectResponse
    {
        Gate::authorize('resetDevice', $user);

        $deviceAccess->resetDevice($user);

        return back()->with('success', 'El dispositivo autorizado fue reseteado y sus sesiones quedaron cerradas.');
    }
}
