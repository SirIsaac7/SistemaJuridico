<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateRolePermissionsRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{
    public function edit(Role $role): Response
    {
        Gate::authorize('assignPermissions', $role);
        $this->ensureRoleIsEditable($role);

        $permissions = Permission::query()
            ->where('guard_name', 'web')
            ->orderBy('name')
            ->get(['id', 'name'])
            ->keyBy('name');

        $permissionGroups = collect(config('access_control.permission_groups'))
            ->map(function (array $group, string $key) use ($permissions): array {
                return [
                    'key' => $key,
                    'label' => $group['label'],
                    'description' => $group['description'],
                    'permissions' => collect($group['permissions'])
                        ->filter(fn (array $permission): bool => $permissions->has($permission['name']))
                        ->map(fn (array $permission): array => [
                            'id' => $permissions->get($permission['name'])->id,
                            'name' => $permission['name'],
                            'label' => $permission['label'],
                        ])
                        ->values()
                        ->all(),
                ];
            })
            ->values();

        return Inertia::render('admin/roles/permissions', [
            'role' => [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions()->pluck('name')->values(),
            ],
            'permissionGroups' => $permissionGroups,
        ]);
    }

    public function update(UpdateRolePermissionsRequest $request, Role $role): RedirectResponse
    {
        $this->ensureRoleIsEditable($role);
        $role->syncPermissions($request->validated('permissions', []));

        return back()->with('success', 'Los permisos del rol fueron actualizados.');
    }

    private function ensureRoleIsEditable(Role $role): void
    {
        abort_if($role->name === config('access_control.super_admin_role'), 403);
    }
}
