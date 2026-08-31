<?php

namespace Tests\Unit;

use App\Models\Archivo;
use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Tests\TestCase;

class LibroModelsTest extends TestCase
{
    public function test_models_expose_their_expected_relationships(): void
    {
        $docente = new User;
        $materia = new Materia;
        $archivo = new Archivo;
        $solicitud = new SolicitudAcceso;

        $this->assertHasManyRelationship($docente->materiasImpartidas(), 'docente_id');
        $this->assertHasManyRelationship($docente->solicitudesAcceso(), 'usuario_id');
        $this->assertHasManyRelationship($docente->solicitudesRespondidas(), 'respondido_por');
        $this->assertBelongsToRelationship($materia->docente(), 'docente_id');
        $this->assertHasManyRelationship($materia->archivos(), 'materia_id');
        $this->assertHasManyRelationship($materia->solicitudesAcceso(), 'materia_id');
        $this->assertBelongsToRelationship($archivo->materia(), 'materia_id');
        $this->assertBelongsToRelationship($solicitud->usuario(), 'usuario_id');
        $this->assertBelongsToRelationship($solicitud->materia(), 'materia_id');
        $this->assertBelongsToRelationship($solicitud->respondidoPor(), 'respondido_por');
    }

    public function test_models_apply_defaults_and_casts(): void
    {
        $materia = new Materia(['is_active' => 1]);
        $archivo = new Archivo([
            'tamano_bytes' => '2048',
            'is_active' => 1,
        ]);
        $solicitud = new SolicitudAcceso;

        $this->assertTrue($materia->is_active);
        $this->assertTrue($archivo->is_active);
        $this->assertSame(2048, $archivo->tamano_bytes);
        $this->assertSame(SolicitudAcceso::ESTADO_PENDIENTE, $solicitud->estado);
    }

    public function test_reusable_scopes_build_the_expected_filters(): void
    {
        $docente = (new User)->setAttribute('id', 10);
        $estudiante = (new User)->setAttribute('id', 20);
        $materia = (new Materia)->setAttribute('id', 30);

        $materias = Materia::query()->delDocente($docente)->activas();
        $archivos = Archivo::query()->deMateria($materia)->activos();
        $solicitudes = SolicitudAcceso::query()
            ->paraDocente($docente)
            ->delUsuario($estudiante)
            ->pendientes();

        $this->assertSame([10, true], $materias->getBindings());
        $this->assertSame([30, true], $archivos->getBindings());
        $this->assertSame([10, 20, SolicitudAcceso::ESTADO_PENDIENTE], $solicitudes->getBindings());
    }

    private function assertHasManyRelationship(HasMany $relationship, string $foreignKey): void
    {
        $this->assertSame($foreignKey, $relationship->getForeignKeyName());
    }

    private function assertBelongsToRelationship(BelongsTo $relationship, string $foreignKey): void
    {
        $this->assertSame($foreignKey, $relationship->getForeignKeyName());
    }
}
