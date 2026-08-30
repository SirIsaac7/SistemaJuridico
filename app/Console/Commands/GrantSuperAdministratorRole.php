<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Spatie\Permission\Models\Role;

class GrantSuperAdministratorRole extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'access:grant-super-admin {email : Correo del usuario existente}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Asigna el rol protegido de superadministrador a un usuario existente';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $email = mb_strtolower(trim((string) $this->argument('email')));
        $user = User::query()->where('email', $email)->first();

        if (! $user) {
            $this->error("No existe un usuario con el correo {$email}.");

            return self::FAILURE;
        }

        $role = Role::findOrCreate(config('access_control.super_admin_role'), 'web');
        $user->assignRole($role);

        $this->info("El rol superadministrador fue asignado a {$user->name} ({$user->email}).");

        return self::SUCCESS;
    }
}
