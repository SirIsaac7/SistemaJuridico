<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use App\Support\DateTimeFormatter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): Response
    {
        Gate::authorize('viewAny', Role::class);

        $protectedRole = config('access_control.super_admin_role');
        $roles = Role::query()
            ->select(['id', 'name', 'guard_name', 'created_at'])
            ->withCount(['permissions', 'users'])
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (Role $role): array => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions_count' => $role->permissions_count,
                'users_count' => $role->users_count,
                'created_at' => DateTimeFormatter::forDisplay($role->created_at),
                'is_protected' => $role->name === $protectedRole,
                'can' => [
                    'update' => $role->name !== $protectedRole && Gate::allows('update', $role),
                    'delete' => $role->name !== $protectedRole && Gate::allows('delete', $role),
                    'assign_permissions' => $role->name !== $protectedRole && Gate::allows('assignPermissions', $role),
                ],
            ]);

        return Inertia::render('admin/roles/index', [
            'roles' => $roles,
        ]);
    }

    public function store(StoreRoleRequest $request): RedirectResponse
    {
        Role::create([
            'name' => $request->validated('name'),
            'guard_name' => 'web',
        ]);

        return back()->with('success', 'El rol fue creado correctamente.');
    }

    public function update(UpdateRoleRequest $request, Role $role): RedirectResponse
    {
        $this->ensureRoleIsEditable($role);

        $role->update(['name' => $request->validated('name')]);

        return back()->with('success', 'El nombre del rol fue actualizado.');
    }

    public function destroy(Role $role): RedirectResponse
    {
        Gate::authorize('delete', $role);
        $this->ensureRoleIsEditable($role);

        if ($role->users()->exists()) {
            throw ValidationException::withMessages([
                'role' => 'No puedes eliminar un rol que todavía está asignado a usuarios.',
            ]);
        }

        $role->delete();

        return back()->with('success', 'El rol fue eliminado correctamente.');
    }

    private function ensureRoleIsEditable(Role $role): void
    {
        abort_if($role->name === config('access_control.super_admin_role'), 403);
    }
}
