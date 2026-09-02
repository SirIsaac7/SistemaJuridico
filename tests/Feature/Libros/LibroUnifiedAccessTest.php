<?php

namespace Tests\Feature\Libros;

use App\Models\AccesoMateria;
use App\Models\Archivo;
use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class LibroUnifiedAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_same_front_combines_subjects_according_to_assigned_permissions(): void
    {
        $this->withoutVite();
        $user = $this->userWithPermissions(
            'libros.ver',
            'libros.materias.ver',
            'libros.accesos.ver-propios',
        );
        $ownedSubject = Materia::factory()->for($user, 'docente')->create(['nombre' => 'Materia impartida']);
        $otherTeacher = User::factory()->create();
        $grantedSubject = Materia::factory()->for($otherTeacher, 'docente')->create(['nombre' => 'Materia concedida']);
        Materia::factory()->for($otherTeacher, 'docente')->create(['nombre' => 'Materia ajena']);
        $this->grantAccess($user, $grantedSubject, $otherTeacher);

        $this->actingAs($user)
            ->get(route('libros.index'))
            ->assertOk()
            ->assertInertia(fn (Assert $page): Assert => $page
                ->component('libros/index', false)
                ->has('materias', 2)
                ->where('materias.0.id', $grantedSubject->id)
                ->where('materias.0.context.has_granted_access', true)
                ->where('materias.0.context.can_manage', false)
                ->where('materias.1.id', $ownedSubject->id)
                ->where('materias.1.context.can_manage', true)
                ->where('materias.1.context.has_granted_access', false)
                ->where('can.supervise', false));
    }

    public function test_student_detail_uses_same_page_but_only_exposes_active_visualizable_files(): void
    {
        $this->withoutVite();
        $student = $this->userWithPermissions('libros.ver', 'libros.accesos.ver-propios');
        $teacher = User::factory()->create();
        $materia = Materia::factory()->for($teacher, 'docente')->create();
        $visibleFile = Archivo::factory()->for($materia)->create(['titulo' => 'PDF visible']);
        Archivo::factory()->for($materia)->inactivo()->create(['titulo' => 'PDF inhabilitado']);
        Archivo::factory()->for($materia)->create([
            'titulo' => 'Documento no visualizable',
            'tipo' => Archivo::TIPO_DOCUMENTO,
        ]);
        $this->grantAccess($student, $materia, $teacher);

        $this->actingAs($student)
            ->get(route('libros.materias.show', $materia))
            ->assertOk()
            ->assertInertia(fn (Assert $page): Assert => $page
                ->component('libros/materias/show', false)
                ->has('materia.archivos', 1)
                ->where('materia.archivos.0.id', $visibleFile->id)
                ->where('materia.students', null)
                ->where('context.has_granted_access', true)
                ->where('context.can_manage', false)
                ->where('can.update', false)
                ->where('can.upload_file', false));
    }

    public function test_scope_filter_cannot_grant_a_capability_the_user_does_not_have(): void
    {
        $this->withoutVite();
        $student = $this->userWithPermissions('libros.ver', 'libros.accesos.ver-propios');
        $teacher = User::factory()->create();
        $materia = Materia::factory()->for($teacher, 'docente')->create();
        $this->grantAccess($student, $materia, $teacher);

        $this->actingAs($student)
            ->get(route('libros.index', ['ambito' => 'impartidas']))
            ->assertOk()
            ->assertInertia(fn (Assert $page): Assert => $page
                ->has('materias', 0)
                ->where('filters.ambito', 'impartidas'));
    }

    public function test_previous_subject_urls_redirect_to_the_unified_front(): void
    {
        $user = $this->userWithPermissions('libros.ver', 'libros.materias.ver');
        $materia = Materia::factory()->for($user, 'docente')->create();

        $this->actingAs($user)
            ->get(route('libros.materias.index'))
            ->assertRedirect(route('libros.index'));
        $this->actingAs($user)
            ->get(route('libros.mis-materias.show', $materia))
            ->assertRedirect(route('libros.materias.show', $materia));
        $this->actingAs($user)
            ->get(route('libros.administracion.materias.show', $materia))
            ->assertRedirect(route('libros.materias.show', $materia));
    }

    private function grantAccess(User $student, Materia $materia, User $teacher): AccesoMateria
    {
        $request = SolicitudAcceso::factory()
            ->for($student, 'usuario')
            ->for($materia)
            ->aceptada($teacher)
            ->create();

        return AccesoMateria::factory()->create([
            'solicitud_id' => $request->id,
            'usuario_id' => $student->id,
            'materia_id' => $materia->id,
        ]);
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
