<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        collect(config('access_control.permission_groups'))
            ->flatMap(fn (array $group): array => $group['permissions'])
            ->each(function (array $permission): void {
                Permission::firstOrCreate([
                    'name' => $permission['name'],
                    'guard_name' => 'web',
                ]);
            });

        Role::findOrCreate(config('access_control.super_admin_role'), 'web');

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
