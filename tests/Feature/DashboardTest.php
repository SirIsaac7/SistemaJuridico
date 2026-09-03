<?php

namespace Tests\Feature;

use App\Models\AccesoMateria;
use App\Models\Archivo;
use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Models\User;
use Database\Seeders\RolePermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $this->get('/dashboard')->assertRedirect('/login');
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $this->withoutVite();
        $this->actingAs($user = User::factory()->create());

        $this->get('/dashboard')->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboard.cards', [])
            ->where('dashboard.sections', []));
    }

    public function test_teacher_dashboard_contains_only_owned_library_statistics(): void
    {
        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);

        $teacher = User::factory()->create();
        $teacher->assignRole(config('access_control.docente_role'));
        $otherTeacher = User::factory()->create();

        $activeSubject = Materia::factory()->for($teacher, 'docente')->create();
        Materia::factory()->for($teacher, 'docente')->inactiva()->create();
        $otherSubject = Materia::factory()->for($otherTeacher, 'docente')->create();

        Archivo::factory()->for($activeSubject)->create();
        Archivo::factory()->for($activeSubject)->inactivo()->create();
        Archivo::factory()->for($otherSubject)->count(3)->create();
        SolicitudAcceso::factory()->for($activeSubject)->create();
        SolicitudAcceso::factory()->for($otherSubject)->count(2)->create();

        $response = $this->actingAs($teacher)->get('/dashboard');

        $response->assertInertia(fn (Assert $page) => $page
            ->component('dashboard')
            ->where('dashboard.cards.0.key', 'mis-materias')
            ->where('dashboard.cards.0.value', 2)
            ->where('dashboard.cards.1.key', 'mis-archivos')
            ->where('dashboard.cards.1.value', 1)
            ->where('dashboard.cards.2.key', 'solicitudes-recibidas')
            ->where('dashboard.cards.2.value', 1)
            ->where('dashboard.sections.0.key', 'docencia')
            ->where('dashboard.sections.1.key', 'solicitudes-recibidas'));
    }

    public function test_student_dashboard_contains_only_personal_access_and_request_statistics(): void
    {
        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);

        $student = User::factory()->create();
        $student->assignRole(config('access_control.estudiante_role'));
        $teacher = User::factory()->create();
        $subject = Materia::factory()->for($teacher, 'docente')->create();

        SolicitudAcceso::factory()->for($student, 'usuario')->for($subject)->create();
        SolicitudAcceso::factory()->for($subject)->count(2)->create();
        $approvedRequest = SolicitudAcceso::factory()->for($student, 'usuario')->for($subject)->aceptada($teacher)->create();
        AccesoMateria::factory()->for($approvedRequest, 'solicitud')->create();

        $response = $this->actingAs($student)->get('/dashboard');

        $response->assertInertia(fn (Assert $page) => $page
            ->where('dashboard.cards.0.key', 'catalogo')
            ->where('dashboard.cards.1.key', 'mis-accesos')
            ->where('dashboard.cards.1.value', 1)
            ->where('dashboard.cards.2.key', 'mis-solicitudes')
            ->where('dashboard.cards.2.value', 1)
            ->where('dashboard.sections.0.key', 'mis-solicitudes')
            ->where('dashboard.sections.0.items.1.value', 1));
    }

    public function test_administrator_dashboard_contains_global_library_statistics(): void
    {
        $this->withoutVite();
        $this->seed(RolePermissionSeeder::class);

        $administrator = User::factory()->create();
        $administrator->assignRole(config('access_control.admin_role'));
        $subject = Materia::factory()->create();

        Materia::factory()->inactiva()->create();
        Archivo::factory()->for($subject)->count(2)->create();
        SolicitudAcceso::factory()->for($subject)->count(3)->create();

        $response = $this->actingAs($administrator)->get('/dashboard');

        $response->assertInertia(fn (Assert $page) => $page
            ->where('dashboard.cards.0.key', 'materias')
            ->where('dashboard.cards.0.value', 2)
            ->where('dashboard.cards.1.key', 'archivos')
            ->where('dashboard.cards.1.value', 2)
            ->where('dashboard.cards.2.key', 'solicitudes')
            ->where('dashboard.cards.2.value', 3)
            ->where('dashboard.sections.0.key', 'biblioteca')
            ->where('dashboard.sections.1.key', 'solicitudes-globales'));
    }
}
