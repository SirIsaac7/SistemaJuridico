<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreUserRequest;
use App\Http\Requests\Admin\UpdateUserRequest;
use App\Models\User;
use App\Support\DateTimeFormatter;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', User::class);

        $search = trim($request->string('search')->toString());
        $status = in_array($request->string('status')->toString(), ['all', 'active', 'blocked', 'deleted'], true)
            ? $request->string('status')->toString()
            : 'all';
        $roleId = $request->integer('role') ?: null;
        $onlySuperAdministratorId = $this->onlySuperAdministratorId();
        $query = $status === 'deleted' ? User::onlyTrashed() : User::query();

        $users = $query
            ->select(['id', 'name', 'email', 'is_active', 'created_at', 'deleted_at'])
            ->with([
                'roles:id,name',
                'dispositivoActivo',
            ])
            ->when($status === 'active', fn ($query) => $query->where('is_active', true))
            ->when($status === 'blocked', fn ($query) => $query->where('is_active', false))
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($roleId, fn ($query) => $query->whereHas('roles', fn ($query) => $query->whereKey($roleId)))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate(10)
            ->withQueryString();

        $users->through(fn (User $user): array => $this->userData($user, $request->user(), $onlySuperAdministratorId));

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'roles' => Role::query()
                ->select(['id', 'name'])
                ->withCount('users')
                ->orderBy('name')
                ->get(),
            'filters' => [
                'search' => $search,
                'status' => $status,
                'role' => $roleId,
            ],
            'counts' => [
                'all' => User::count(),
                'active' => User::query()->where('is_active', true)->count(),
                'blocked' => User::query()->where('is_active', false)->count(),
                'deleted' => User::onlyTrashed()->count(),
            ],
        ]);
    }

    public function store(StoreUserRequest $request): RedirectResponse
    {
        $data = $request->safe()->only(['name', 'email', 'password']);
        $role = Role::query()->findOrFail($request->integer('role_id'));

        DB::transaction(function () use ($data, $role): void {
            $user = User::create($data);
            $user->markEmailAsVerified();
            $user->syncRoles([$role]);
        });

        return back()->with('success', 'El usuario fue creado correctamente.');
    }

    public function update(UpdateUserRequest $request, User $user): RedirectResponse
    {
        $data = $request->safe()->only(['name', 'email', 'password']);

        if (blank($data['password'] ?? null)) {
            unset($data['password']);
        }

        $role = null;

        if ($request->filled('role_id')) {
            Gate::authorize('assignRole', $user);

            if ($request->user()->is($user)) {
                throw ValidationException::withMessages([
                    'user' => 'No puedes cambiar tu propio rol.',
                ]);
            }

            $role = Role::query()->findOrFail($request->integer('role_id'));

            if ($user->isOnlySuperAdministrator() && $role->name !== config('access_control.super_admin_role')) {
                throw ValidationException::withMessages([
                    'user' => 'Debe existir al menos un super administrador activo.',
                ]);
            }
        }

        DB::transaction(function () use ($user, $data, $role): void {
            $user->update($data);

            if ($role) {
                $user->syncRoles([$role]);
            }
        });

        return back()->with('success', 'Los datos del usuario fueron actualizados.');
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        Gate::authorize('delete', $user);

        if ($request->user()->is($user)) {
            throw ValidationException::withMessages([
                'user' => 'No puedes eliminar tu propia cuenta.',
            ]);
        }

        if ($user->isOnlySuperAdministrator()) {
            throw ValidationException::withMessages([
                'user' => 'Debe existir al menos un super administrador activo.',
            ]);
        }

        $user->delete();

        return back()->with('success', 'El usuario fue enviado a la papelera.');
    }

    private function onlySuperAdministratorId(): ?int
    {
        $superAdministratorIds = User::query()
            ->whereHas('roles', fn ($query) => $query->where('name', config('access_control.super_admin_role')))
            ->limit(2)
            ->pluck('id');

        return $superAdministratorIds->count() === 1 ? $superAdministratorIds->first() : null;
    }

    /**
     * @return array<string, mixed>
     */
    private function userData(User $user, User $authenticatedUser, ?int $onlySuperAdministratorId): array
    {
        $role = $user->roles->first();
        $isDeleted = $user->trashed();
        $isCurrentUser = $authenticatedUser->is($user);
        $isOnlySuperAdministrator = $onlySuperAdministratorId === $user->id;
        $device = $user->dispositivoActivo;

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'initials' => str($user->name)->explode(' ')->filter()->take(2)->map(
                fn (string $part): string => mb_strtoupper(mb_substr($part, 0, 1))
            )->join(''),
            'is_active' => $user->is_active,
            'is_deleted' => $isDeleted,
            'created_at' => DateTimeFormatter::forDisplay($user->created_at),
            'deleted_at' => DateTimeFormatter::forDisplay($user->deleted_at),
            'role' => $role ? ['id' => $role->id, 'name' => $role->name] : null,
            'is_current_user' => $isCurrentUser,
            'device' => $device ? [
                'tipo_dispositivo' => $device->tipo_dispositivo,
                'sistema_operativo' => $device->sistema_operativo,
                'navegador' => $device->navegador,
                'estado' => $device->estado,
                'fecha_vinculacion' => DateTimeFormatter::forDisplay($device->fecha_vinculacion),
                'ultimo_acceso' => DateTimeFormatter::forDisplay($device->ultimo_acceso),
            ] : null,
            'can' => [
                'update' => ! $isDeleted && Gate::allows('update', $user),
                'delete' => ! $isDeleted && ! $isCurrentUser && ! $isOnlySuperAdministrator && Gate::allows('delete', $user),
                'update_status' => ! $isDeleted && ! $isCurrentUser && ! $isOnlySuperAdministrator && Gate::allows('updateStatus', $user),
                'assign_role' => ! $isDeleted && ! $isCurrentUser && ! $isOnlySuperAdministrator && Gate::allows('assignRole', $user),
                'restore' => $isDeleted && Gate::allows('restore', $user),
                'reset_device' => ! $isDeleted && ! $isCurrentUser && $device !== null && Gate::allows('resetDevice', $user),
            ],
        ];
    }
}
