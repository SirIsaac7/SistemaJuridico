<?php

namespace Tests\Feature\Libros;

use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class RolePermissionSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_seeder_assigns_module_permissions_to_default_roles(): void
    {
        $this->seed(RolePermissionSeeder::class);

        $docente = Role::findByName(config('access_control.docente_role'));
        $estudiante = Role::findByName(config('access_control.estudiante_role'));
        $administrador = Role::findByName(config('access_control.admin_role'));

        $this->assertTrue($docente->hasPermissionTo('libros.materias.crear'));
        $this->assertTrue($docente->hasPermissionTo('libros.solicitudes.responder'));
        $this->assertFalse($docente->hasPermissionTo('libros.solicitudes.crear'));
        $this->assertTrue($estudiante->hasPermissionTo('libros.catalogo.ver'));
        $this->assertTrue($estudiante->hasPermissionTo('libros.solicitudes.crear'));
        $this->assertFalse($estudiante->hasPermissionTo('libros.materias.crear'));
        $this->assertTrue($administrador->hasPermissionTo('libros.ver'));
        $this->assertTrue($administrador->hasPermissionTo('libros.administracion.ver'));
        $this->assertTrue($administrador->hasPermissionTo('libros.materias.crear-para-docente'));
        $this->assertFalse($administrador->hasPermissionTo('libros.materias.editar'));
    }
}
