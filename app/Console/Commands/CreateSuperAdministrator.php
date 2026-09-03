<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Spatie\Permission\Models\Role;

class CreateSuperAdministrator extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'access:create-super-admin';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Crea de forma interactiva y segura una cuenta superadministradora';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $name = trim((string) $this->ask('Nombre completo'));
        $email = mb_strtolower(trim((string) $this->ask('Correo electrónico')));
        $password = (string) $this->secret('Contraseña');
        $passwordConfirmation = (string) $this->secret('Confirmar contraseña');

        $validator = Validator::make([
            'name' => $name,
            'email' => $email,
            'password' => $password,
            'password_confirmation' => $passwordConfirmation,
        ], [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
        ], [
            'name.required' => 'Debes ingresar el nombre completo.',
            'email.required' => 'Debes ingresar el correo electrónico.',
            'email.email' => 'El correo electrónico no tiene un formato válido.',
            'email.unique' => 'Ya existe un usuario con ese correo electrónico.',
            'password.required' => 'Debes ingresar una contraseña.',
            'password.confirmed' => 'La confirmación de la contraseña no coincide.',
        ]);

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $error) {
                $this->error($error);
            }

            return self::FAILURE;
        }

        if (! $this->confirm("¿Crear la cuenta superadministradora para {$email}?", true)) {
            $this->warn('La creación fue cancelada. No se realizó ningún cambio.');

            return self::FAILURE;
        }

        $user = DB::transaction(function () use ($name, $email, $password): User {
            $user = User::create([
                'name' => $name,
                'email' => $email,
                'password' => $password,
            ]);
            $role = Role::findOrCreate(config('access_control.super_admin_role'), 'web');
            $user->assignRole($role);

            return $user;
        }, 3);

        event(new Registered($user));

        $this->newLine();
        $this->info("La cuenta superadministradora fue creada para {$user->name} ({$user->email}).");
        $this->line('Revisa ese correo y completa la verificación antes de iniciar sesión.');

        return self::SUCCESS;
    }
}
