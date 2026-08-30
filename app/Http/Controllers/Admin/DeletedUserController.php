<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;

class DeletedUserController extends Controller
{
    public function update(int $user): RedirectResponse
    {
        $deletedUser = User::onlyTrashed()->findOrFail($user);
        Gate::authorize('restore', $deletedUser);

        $deletedUser->restore();

        return back()->with('success', 'El usuario fue restaurado correctamente.');
    }
}
