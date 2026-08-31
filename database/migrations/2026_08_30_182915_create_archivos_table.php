<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('archivos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('materia_id')
                ->constrained('materias')
                ->restrictOnDelete();
            $table->string('titulo');
            $table->text('descripcion')->nullable();
            $table->string('nombre_original');
            $table->string('tipo', 50);
            $table->string('mime_type', 150);
            $table->string('extension', 20)->nullable();
            $table->string('disk', 50);
            $table->string('ruta', 500);
            $table->unsignedBigInteger('tamano_bytes');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['disk', 'ruta']);
            $table->index(['materia_id', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archivos');
    }
};
