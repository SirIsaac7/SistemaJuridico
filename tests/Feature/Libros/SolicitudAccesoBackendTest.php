<?php

namespace Tests\Feature\Libros;

use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class SolicitudAccesoBackendTest extends TestCase
{
    use RefreshDatabase;

    public function test_student_can_request_active_subject_without_resending_profile_data(): void
    {
        $student = $this->userWithPermissions('libros.solicitudes.crear');
        $teacher = User::factory()->create();
        $materia = Materia::factory()->for($teacher, 'docente')->create();

        $this->actingAs($student)
            ->post(route('libros.solicitudes.store', $materia), [
                'universidad' => '  Universidad   Mayor de San Andrés ',
                'observacion' => 'Solicito acceso.',
                'usuario_id' => User::factory()->create()->id,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertDatabaseHas('solicitudes_acceso', [
            'usuario_id' => $student->id,
            'materia_id' => $materia->id,
            'universidad' => 'Universidad Mayor de San Andrés',
            'estado' => SolicitudAcceso::ESTADO_PENDIENTE,
        ]);
    }

    public function test_student_cannot_create_two_pending_requests_for_same_subject(): void
    {
        $student = $this->userWithPermissions('libros.solicitudes.crear');
        $materia = Materia::factory()->create();
        SolicitudAcceso::factory()->for($student, 'usuario')->for($materia)->create();

        $this->actingAs($student)
            ->post(route('libros.solicitudes.store', $materia), [
                'universidad' => 'Universidad de ejemplo',
            ])
            ->assertSessionHasErrors('materia');

        $this->assertSame(1, SolicitudAcceso::query()->count());
    }

    public function test_student_cannot_request_subject_that_was_already_accepted(): void
    {
        $student = $this->userWithPermissions('libros.solicitudes.crear');
        $teacher = User::factory()->create();
        $materia = Materia::factory()->for($teacher, 'docente')->create();
        SolicitudAcceso::factory()
            ->for($student, 'usuario')
            ->for($materia)
            ->aceptada($teacher)
            ->create();

        $this->actingAs($student)
            ->post(route('libros.solicitudes.store', $materia), [
                'universidad' => 'Universidad de ejemplo',
            ])
            ->assertSessionHasErrors('materia');

        $this->assertSame(1, SolicitudAcceso::query()->count());
    }

    public function test_owner_teacher_can_reject_request_with_reason(): void
    {
        $teacher = $this->userWithPermissions('libros.solicitudes.responder');
        $student = User::factory()->create();
        $materia = Materia::factory()->for($teacher, 'docente')->create();
        $solicitud = SolicitudAcceso::factory()->for($student, 'usuario')->for($materia)->create();

        $this->actingAs($teacher)
            ->put(route('libros.solicitudes-recibidas.update', $solicitud), [
                'estado' => SolicitudAcceso::ESTADO_RECHAZADA,
                'motivo_respuesta' => 'Información insuficiente.',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $solicitud->refresh();
        $this->assertSame(SolicitudAcceso::ESTADO_RECHAZADA, $solicitud->estado);
        $this->assertSame('Información insuficiente.', $solicitud->motivo_respuesta);
        $this->assertSame($teacher->id, $solicitud->respondido_por);
        $this->assertNotNull($solicitud->fecha_respuesta);
    }

    public function test_rejection_requires_reason_and_another_teacher_cannot_respond(): void
    {
        $owner = User::factory()->create();
        $materia = Materia::factory()->for($owner, 'docente')->create();
        $solicitud = SolicitudAcceso::factory()->for($materia)->create();
        $otherTeacher = $this->userWithPermissions('libros.solicitudes.responder');

        $this->actingAs($owner->givePermissionTo(Permission::findOrCreate('libros.solicitudes.responder')))
            ->put(route('libros.solicitudes-recibidas.update', $solicitud), [
                'estado' => SolicitudAcceso::ESTADO_RECHAZADA,
            ])
            ->assertSessionHasErrors('motivo_respuesta');
        $this->actingAs($otherTeacher)
            ->put(route('libros.solicitudes-recibidas.update', $solicitud), [
                'estado' => SolicitudAcceso::ESTADO_ACEPTADA,
            ])
            ->assertForbidden();

        $this->assertSame(SolicitudAcceso::ESTADO_PENDIENTE, $solicitud->fresh()->estado);
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
