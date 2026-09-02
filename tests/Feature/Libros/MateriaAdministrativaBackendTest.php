<?php

namespace Tests\Feature\Libros;

use App\Models\AccesoMateria;
use App\Models\Archivo;
use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class MateriaAdministrativaBackendTest extends TestCase
{
    use RefreshDatabase;

    public function test_authorized_user_can_create_a_subject_for_an_active_teacher(): void
    {
        $administrator = $this->userWithPermissions('libros.materias.crear-para-docente');
        $teacher = User::factory()->create();
        $teacher->assignRole(Role::findOrCreate(config('access_control.docente_role')));

        $this->actingAs($administrator)
            ->post(route('libros.materias-para-docentes.store'), [
                'docente_id' => $teacher->id,
                'nombre' => '  Derecho   Administrativo  ',
                'descripcion' => 'Materia asignada por administración.',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors()
            ->assertSessionHas('success');

        $this->assertDatabaseHas('materias', [
            'docente_id' => $teacher->id,
            'nombre' => 'Derecho Administrativo',
            'descripcion' => 'Materia asignada por administración.',
        ]);
        $this->assertDatabaseMissing('materias', [
            'docente_id' => $administrator->id,
            'nombre' => 'Derecho Administrativo',
        ]);
    }

    public function test_user_without_administrative_creation_permission_cannot_assign_a_subject(): void
    {
        $user = User::factory()->create();
        $teacher = User::factory()->create();
        $teacher->assignRole(Role::findOrCreate(config('access_control.docente_role')));

        $this->actingAs($user)
            ->post(route('libros.materias-para-docentes.store'), [
                'docente_id' => $teacher->id,
                'nombre' => 'Derecho Procesal',
            ])
            ->assertForbidden();

        $this->assertDatabaseMissing('materias', [
            'docente_id' => $teacher->id,
            'nombre' => 'Derecho Procesal',
        ]);
    }

    public function test_administrative_creation_only_accepts_active_users_with_teacher_role(): void
    {
        $administrator = $this->userWithPermissions('libros.materias.crear-para-docente');
        $notTeacher = User::factory()->create();
        $inactiveTeacher = User::factory()->create(['is_active' => false]);
        $inactiveTeacher->assignRole(Role::findOrCreate(config('access_control.docente_role')));

        $this->actingAs($administrator)
            ->from(route('libros.index'))
            ->post(route('libros.materias-para-docentes.store'), [
                'docente_id' => $notTeacher->id,
                'nombre' => 'Materia inválida',
            ])
            ->assertRedirect(route('libros.index'))
            ->assertSessionHasErrors('docente_id');

        $this->actingAs($administrator)
            ->from(route('libros.index'))
            ->post(route('libros.materias-para-docentes.store'), [
                'docente_id' => $inactiveTeacher->id,
                'nombre' => 'Otra materia inválida',
            ])
            ->assertRedirect(route('libros.index'))
            ->assertSessionHasErrors('docente_id');

        $this->assertDatabaseCount('materias', 0);
    }

    public function test_administrative_index_only_exposes_active_teachers_to_authorized_users(): void
    {
        $this->withoutVite();
        $administrator = $this->userWithPermissions(
            'libros.ver',
            'libros.administracion.ver',
            'libros.materias.crear-para-docente',
        );
        $teacherRole = Role::findOrCreate(config('access_control.docente_role'));
        $activeTeacher = User::factory()->create(['name' => 'Docente Activo']);
        $activeTeacher->assignRole($teacherRole);
        $inactiveTeacher = User::factory()->create(['name' => 'Docente Inactivo', 'is_active' => false]);
        $inactiveTeacher->assignRole($teacherRole);
        User::factory()->create(['name' => 'Usuario sin rol docente']);

        $this->actingAs($administrator)
            ->get(route('libros.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): Assert => $page
                ->component('libros/index', false)
                ->where('can.create_for_teacher', true)
                ->has('docentes', 1)
                ->where('docentes.0.id', $activeTeacher->id)
                ->where('docentes.0.name', 'Docente Activo'));
    }

    public function test_authorized_administrator_can_see_every_teachers_subject(): void
    {
        $this->withoutVite();
        $administrator = $this->userWithPermissions('libros.ver', 'libros.administracion.ver');
        $firstTeacher = User::factory()->create(['name' => 'Ana Docente']);
        $secondTeacher = User::factory()->create(['name' => 'Bruno Docente']);
        Materia::factory()->for($firstTeacher, 'docente')->create(['nombre' => 'Derecho Civil']);
        Materia::factory()->for($secondTeacher, 'docente')->inactiva()->create(['nombre' => 'Derecho Penal']);

        $this->actingAs($administrator)
            ->get(route('libros.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): Assert => $page
                ->component('libros/index', false)
                ->has('materias', 2)
                ->where('materias.0.nombre', 'Derecho Penal')
                ->where('materias.0.docente.nombre', 'Bruno Docente')
                ->where('materias.1.nombre', 'Derecho Civil')
                ->where('materias.1.docente.nombre', 'Ana Docente'));
    }

    public function test_administrative_detail_contains_all_files_and_granted_students(): void
    {
        $this->withoutVite();
        $administrator = $this->userWithPermissions('libros.ver', 'libros.administracion.ver');
        $teacher = User::factory()->create(['name' => 'Docente Titular']);
        $student = User::factory()->create(['name' => 'Estudiante Inscrito']);
        $materia = Materia::factory()->for($teacher, 'docente')->create(['nombre' => 'Derecho Constitucional']);
        Archivo::factory()->for($materia)->create(['titulo' => 'Archivo activo']);
        Archivo::factory()->for($materia)->inactivo()->create(['titulo' => 'Archivo inhabilitado']);
        $solicitud = SolicitudAcceso::factory()
            ->for($student, 'usuario')
            ->for($materia)
            ->aceptada($teacher)
            ->create(['universidad' => 'Universidad Mayor']);
        AccesoMateria::factory()->create([
            'solicitud_id' => $solicitud->id,
            'usuario_id' => $student->id,
            'materia_id' => $materia->id,
        ]);

        $this->actingAs($administrator)
            ->get(route('libros.materias.show', $materia))
            ->assertOk()
            ->assertInertia(fn (Assert $page): Assert => $page
                ->component('libros/materias/show', false)
                ->where('materia.nombre', 'Derecho Constitucional')
                ->where('materia.docente.nombre', 'Docente Titular')
                ->has('materia.archivos', 2)
                ->has('materia.students', 1)
                ->where('materia.students.0.estudiante.nombre', 'Estudiante Inscrito')
                ->where('materia.students.0.universidad', 'Universidad Mayor')
                ->where('materia.students.0.is_current', true)
                ->where('context.can_supervise', true)
                ->where('can.update', false));
    }

    public function test_user_without_a_materia_capability_sees_an_empty_module_and_cannot_open_details(): void
    {
        $user = $this->userWithPermissions('libros.ver');
        $materia = Materia::factory()->create();

        $this->actingAs($user)
            ->get(route('libros.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): Assert => $page
                ->component('libros/index', false)
                ->has('materias', 0));
        $this->actingAs($user)
            ->get(route('libros.materias.show', $materia))
            ->assertForbidden();
    }

    public function test_super_administrator_can_open_supervision_without_direct_permission(): void
    {
        $this->withoutVite();
        $role = Role::findOrCreate(config('access_control.super_admin_role'));
        $superAdministrator = User::factory()->create();
        $superAdministrator->assignRole($role);

        $this->actingAs($superAdministrator)
            ->get(route('libros.index'))
            ->assertOk();
    }

    public function test_authorized_administrator_can_view_private_file_but_scoped_binding_is_enforced(): void
    {
        Storage::fake('local');
        $administrator = $this->userWithPermissions('libros.ver', 'libros.administracion.ver');
        $materia = Materia::factory()->create();
        $otherMateria = Materia::factory()->create();
        $archivo = Archivo::factory()->for($materia)->create(['ruta' => 'libros/pruebas/administrativo.pdf']);
        Storage::disk('local')->put($archivo->ruta, '%PDF-1.4 contenido administrativo');

        $this->actingAs($administrator)
            ->get(route('libros.administracion.materias.archivos.contenido', [$materia, $archivo]))
            ->assertOk()
            ->assertHeader('Content-Disposition', 'inline; filename='.$archivo->nombre_original);

        $this->actingAs($administrator)
            ->get(route('libros.administracion.materias.archivos.contenido', [$otherMateria, $archivo]))
            ->assertNotFound();
    }

    private function userWithPermissions(string ...$permissions): User
    {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            $user->givePermissionTo(Permission::findOrCreate($permission));
        }

        return $user;
    }
}
