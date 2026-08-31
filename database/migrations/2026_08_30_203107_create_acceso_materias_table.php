<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('accesos_materias', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('materia_id')->constrained('materias')->restrictOnDelete();
            $table->foreignId('solicitud_id')
                ->unique()
                ->constrained('solicitudes_acceso')
                ->restrictOnDelete();
            $table->timestamp('fecha_inicio');
            $table->timestamp('fecha_fin')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['usuario_id', 'materia_id']);
            $table->index(['usuario_id', 'is_active', 'fecha_fin']);
            $table->index(['materia_id', 'is_active']);
        });

        DB::table('solicitudes_acceso')
            ->where('estado', 'aceptada')
            ->orderBy('id')
            ->chunkById(100, function ($solicitudes): void {
                foreach ($solicitudes as $solicitud) {
                    $fechaInicio = $solicitud->fecha_respuesta
                        ?? $solicitud->created_at
                        ?? now();

                    DB::table('accesos_materias')->insertOrIgnore([
                        'usuario_id' => $solicitud->usuario_id,
                        'materia_id' => $solicitud->materia_id,
                        'solicitud_id' => $solicitud->id,
                        'fecha_inicio' => $fechaInicio,
                        'fecha_fin' => null,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accesos_materias');
    }
};
