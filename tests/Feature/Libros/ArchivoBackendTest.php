<?php

namespace Tests\Feature\Libros;

use App\Models\Archivo;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    private function userWithPermissions(string ...$permissions): User
    {
        $user = User::factory()->create();

        foreach ($permissions as $permission) {
            $user->givePermissionTo(Permission::findOrCreate($permission));
        }

        return $user;
    }
}
