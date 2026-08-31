<?php

namespace Tests\Feature\Libros;

use App\Models\Archivo;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class MateriaBackendTest extends TestCase
{
    use RefreshDatabase;

    public function test_docente_can_create_update_and_disable_own_subject(): void
    {
        $docente = $this->userWithPermissions(
            'libros.materias.crear',
            'libros.materias.editar',
            'libros.materias.cambiar-estado',
        );

        $this->actingAs($docente)
            ->post(route('libros.materias.store'), [
                'nombre' => '  Derecho   Penal  ',
                'descripcion' => 'Contenido jurídico.',
                'docente_id' => User::factory()->create()->id,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();
        $materia = Materia::query()->firstOrFail();

        $this->assertSame($docente->id, $materia->docente_id);
        $this->assertSame('Derecho Penal', $materia->nombre);

        $this->actingAs($docente)
            ->put(route('libros.materias.update', $materia), [
                'nombre' => 'Derecho Penal II',
                'descripcion' => null,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();
        $this->actingAs($docente)
            ->put(route('libros.materias.estado.update', $materia), ['is_active' => false])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('materias', [
            'id' => $materia->id,
            'nombre' => 'Derecho Penal II',
            'is_active' => false,
        ]);
    }

    public function test_docente_cannot_manage_another_teachers_subject(): void
    {
        $owner = User::factory()->create();
        $materia = Materia::factory()->for($owner, 'docente')->create();
        $otherTeacher = $this->userWithPermissions(
            'libros.materias.ver',
            'libros.materias.editar',
            'libros.materias.cambiar-estado',
        );

        $this->actingAs($otherTeacher)
            ->get(route('libros.materias.show', $materia))
            ->assertForbidden();
        $this->actingAs($otherTeacher)
            ->put(route('libros.materias.update', $materia), [
                'nombre' => 'Materia alterada',
                'descripcion' => null,
            ])
            ->assertForbidden();
        $this->actingAs($otherTeacher)
            ->put(route('libros.materias.estado.update', $materia), ['is_active' => false])
            ->assertForbidden();

        $this->assertTrue($materia->fresh()->is_active);
    }

    public function test_docente_can_open_own_subject_with_its_files(): void
    {
        $this->withoutVite();
        $docente = $this->userWithPermissions(
            'libros.materias.ver',
            'libros.archivos.ver',
        );
        $materia = Materia::factory()->for($docente, 'docente')->create();
        $archivo = Archivo::factory()->for($materia)->create([
            'titulo' => 'Constitución Política del Estado',
        ]);

        $this->actingAs($docente)
            ->get(route('libros.materias.show', $materia))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('libros/docente/materias/show', false)
                ->where('materia.id', $materia->id)
                ->has('materia.archivos', 1)
                ->where('materia.archivos.0.id', $archivo->id)
                ->where('materia.archivos.0.titulo', 'Constitución Política del Estado'));
    }

    public function test_student_catalog_exposes_only_subject_and_teacher_identity(): void
    {
        $this->withoutVite();
        $student = $this->userWithPermissions('libros.catalogo.ver', 'libros.solicitudes.crear');
        $teacher = User::factory()->create(['name' => 'María Docente']);
        Materia::factory()->for($teacher, 'docente')->create([
            'nombre' => 'Derecho Civil',
            'descripcion' => 'No debe salir en el catálogo.',
        ]);

        $this->actingAs($student)
            ->get(route('libros.catalogo.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('libros/catalogo/index', false)
                ->has('materias', 1)
                ->where('materias.0.nombre', 'Derecho Civil')
                ->where('materias.0.docente.nombre_completo', 'María Docente')
                ->where('materias.0.has_current_request', false)
                ->where('materias.0.can_request', true)
                ->missing('materias.0.descripcion')
                ->missing('materias.0.archivos'));
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
