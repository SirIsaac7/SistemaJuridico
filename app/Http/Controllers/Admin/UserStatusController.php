<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateUserStatusRequest;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;

class UserStatusController extends Controller
{
    public function __invoke(UpdateUserStatusRequest $request, User $user): RedirectResponse
    {
        if ($request->user()->is($user)) {
            throw ValidationException::withMessages([
                'user' => 'No puedes bloquear tu propia cuenta.',
            ]);
        }

        $isActive = $request->boolean('is_active');

        if (! $isActive && $user->isOnlySuperAdministrator()) {
            throw ValidationException::withMessages([
                'user' => 'Debe existir al menos un super administrador activo.',
            ]);
        }

        $user->update(['is_active' => $isActive]);

        return back()->with('success', $isActive ? 'El usuario fue activado.' : 'El usuario fue bloqueado.');
    }
}
