<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dispositivos_usuario', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->cascadeOnDelete();
            $table->char('device_token_hash', 64);
            $table->string('tipo_dispositivo', 20);
            $table->string('sistema_operativo', 30);
            $table->string('navegador', 20);
            $table->string('estado', 10)->default('activo');
            $table->timestamp('fecha_vinculacion');
            $table->timestamp('ultimo_acceso')->nullable();
            $table->timestamps();

            $table->index(['usuario_id', 'estado']);
            $table->unique(['usuario_id', 'device_token_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dispositivos_usuario');
    }
};
