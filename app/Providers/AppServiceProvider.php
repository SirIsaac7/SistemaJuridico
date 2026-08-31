<?php

namespace App\Providers;

use App\Models\AccesoMateria;
use App\Models\Archivo;
use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Models\User;
use App\Policies\AccesoMateriaPolicy;
use App\Policies\ArchivoPolicy;
use App\Policies\MateriaPolicy;
use App\Policies\RolePolicy;
use App\Policies\SolicitudAccesoPolicy;
use App\Policies\UserPolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Spatie\Permission\Models\Role;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(AccesoMateria::class, AccesoMateriaPolicy::class);
        Gate::policy(Materia::class, MateriaPolicy::class);
        Gate::policy(Archivo::class, ArchivoPolicy::class);
        Gate::policy(SolicitudAcceso::class, SolicitudAccesoPolicy::class);

        Gate::before(function (User $user): ?bool {
            return $user->hasRole(config('access_control.super_admin_role')) ? true : null;
        });
    }
}
