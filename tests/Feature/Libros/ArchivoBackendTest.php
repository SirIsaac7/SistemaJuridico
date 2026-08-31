<?php

namespace Tests\Feature\Libros;

use App\Models\AccesoMateria;
use App\Models\Archivo;
use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class ArchivoBackendTest extends TestCase
{
    use RefreshDatabase;

    public function test_docente_can_upload_and_disable_file_without_physically_deleting_it(): void
    {
        Storage::fake('local');
        config(['libros.disk' => 'local']);
        $docente = $this->userWithPermissions(
            'libros.archivos.subir',
            'libros.archivos.cambiar-estado',
        );
        $materia = Materia::factory()->for($docente, 'docente')->create();

        $this->actingAs($docente)
            ->post(route('libros.materias.archivos.store', $materia), [
                'titulo' => 'Código Penal',
                'descripcion' => 'Documento principal.',
                'tipo' => Archivo::TIPO_PDF,
                'archivo' => UploadedFile::fake()->create('codigo-penal.pdf', 100, 'application/pdf'),
                'disk' => 'public',
                'ruta' => 'ruta-controlada-por-el-usuario',
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();
        $archivo = Archivo::query()->firstOrFail();

        $this->assertSame('local', $archivo->disk);
        $this->assertStringStartsWith("libros/{$docente->id}/{$materia->id}/", $archivo->ruta);
        Storage::disk('local')->assertExists($archivo->ruta);

        $this->actingAs($docente)
            ->put(route('libros.materias.archivos.estado.update', [$materia, $archivo]), [
                'is_active' => false,
            ])
            ->assertRedirect()
            ->assertSessionHasNoErrors();

        $this->assertFalse($archivo->fresh()->is_active);
        Storage::disk('local')->assertExists($archivo->ruta);
    }

    public function test_dangerous_upload_is_rejected(): void
    {
        Storage::fake('local');
        $docente = $this->userWithPermissions('libros.archivos.subir');
        $materia = Materia::factory()->for($docente, 'docente')->create();

        $this->actingAs($docente)
            ->post(route('libros.materias.archivos.store', $materia), [
                'titulo' => 'Archivo peligroso',
                'tipo' => Archivo::TIPO_OTRO,
                'archivo' => UploadedFile::fake()->create('script.php', 10, 'application/x-httpd-php'),
            ])
            ->assertSessionHasErrors('archivo');

        $this->assertDatabaseCount('archivos', 0);
    }

    public function test_other_teacher_cannot_update_or_view_file(): void
    {
        Storage::fake('local');
        $owner = User::factory()->create();
        $materia = Materia::factory()->for($owner, 'docente')->create();
        $archivo = Archivo::factory()->for($materia)->create();
        Storage::disk('local')->put($archivo->ruta, 'contenido');
        $otherTeacher = $this->userWithPermissions(
            'libros.archivos.ver',
            'libros.archivos.editar',
        );

        $this->actingAs($otherTeacher)
            ->put(route('libros.materias.archivos.update', [$materia, $archivo]), [
                'titulo' => 'Alterado',
                'tipo' => Archivo::TIPO_PDF,
            ])
            ->assertForbidden();
        $this->actingAs($otherTeacher)
            ->get(route('libros.materias.archivos.contenido', [$materia, $archivo]))
            ->assertForbidden();

        $this->assertNotSame('Alterado', $archivo->fresh()->titulo);
    }

    public function test_student_with_current_access_uses_protected_viewer_and_range_content(): void
    {
        Storage::fake('local');
        $student = $this->userWithPermissions('libros.accesos.ver-propios');
        $teacher = User::factory()->create();
        $materia = Materia::factory()->for($teacher, 'docente')->create();
        $archivo = Archivo::factory()->for($materia)->create([
            'ruta' => 'libros/pruebas/protegido.pdf',
            'tamano_bytes' => 20,
        ]);
        Storage::disk('local')->put($archivo->ruta, '%PDF-1.4 contenido');
        $this->grantAccess($student, $materia, $teacher);

        $this->actingAs($student)
            ->get(route('libros.mis-materias.archivos.visor', [$materia, $archivo]))
            ->assertOk()
            ->assertInertia(fn (Assert $page): Assert => $page
                ->component('libros/estudiante/archivos/visor')
                ->where('archivo.id', $archivo->id)
                ->where('archivo.tipo', Archivo::TIPO_PDF)
                ->missing('watermark'));

        $this->actingAs($student)
            ->withHeader('Range', 'bytes=0-7')
            ->get(route('libros.mis-materias.archivos.contenido', [$materia, $archivo]))
            ->assertStatus(206)
            ->assertHeader('Content-Range', 'bytes 0-7/18')
            ->assertHeader('Cache-Control', 'max-age=0, no-store, private')
            ->assertHeader('Content-Disposition', 'inline; filename="visualizacion"');
    }

    public function test_student_without_access_cannot_open_viewer_or_content(): void
    {
        Storage::fake('local');
        $student = $this->userWithPermissions('libros.accesos.ver-propios');
        $materia = Materia::factory()->create();
        $archivo = Archivo::factory()->for($materia)->create();
        Storage::disk('local')->put($archivo->ruta, '%PDF-1.4');

        $this->actingAs($student)
            ->get(route('libros.mis-materias.archivos.visor', [$materia, $archivo]))
            ->assertForbidden();
        $this->actingAs($student)
            ->get(route('libros.mis-materias.archivos.contenido', [$materia, $archivo]))
            ->assertForbidden();
    }

    public function test_student_receives_a_watermarked_webp_instead_of_original_image(): void
    {
        Storage::fake('local');
        $student = $this->userWithPermissions('libros.accesos.ver-propios');
        $teacher = User::factory()->create();
        $materia = Materia::factory()->for($teacher, 'docente')->create();
        $uploadedImage = UploadedFile::fake()->image('evidencia.jpg', 1200, 900);
        $path = 'libros/pruebas/evidencia.jpg';
        Storage::disk('local')->put($path, file_get_contents($uploadedImage->getRealPath()));
        $archivo = Archivo::factory()->for($materia)->create([
            'tipo' => Archivo::TIPO_IMAGEN,
            'mime_type' => 'image/jpeg',
            'extension' => 'jpg',
            'ruta' => $path,
            'tamano_bytes' => $uploadedImage->getSize(),
        ]);
        $this->grantAccess($student, $materia, $teacher);

        $this->actingAs($student)
            ->get(route('libros.mis-materias.archivos.contenido', [$materia, $archivo]))
            ->assertOk()
            ->assertHeader('Content-Type', 'image/webp')
            ->assertHeader('Content-Disposition', 'inline; filename="visualizacion"');
    }

    public function test_upload_type_must_match_the_real_file(): void
    {
        Storage::fake('local');
        $teacher = $this->userWithPermissions('libros.archivos.subir');
        $materia = Materia::factory()->for($teacher, 'docente')->create();

        $this->actingAs($teacher)
            ->post(route('libros.materias.archivos.store', $materia), [
                'titulo' => 'Tipo incorrecto',
                'tipo' => Archivo::TIPO_IMAGEN,
                'archivo' => UploadedFile::fake()->create('documento.pdf', 20, 'application/pdf'),
            ])
            ->assertSessionHasErrors('archivo');

        $this->assertDatabaseCount('archivos', 0);
    }

    private function grantAccess(User $student, Materia $materia, User $teacher): AccesoMateria
    {
        $solicitud = SolicitudAcceso::factory()
            ->for($student, 'usuario')
            ->for($materia)
            ->aceptada($teacher)
            ->create();

        return AccesoMateria::factory()->create([
            'solicitud_id' => $solicitud->id,
            'usuario_id' => $student->id,
            'materia_id' => $materia->id,
            'fecha_inicio' => now(),
            'fecha_fin' => null,
            'is_active' => true,
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
