<?php

namespace App\Services\Libros;

use App\Models\Archivo;
use App\Models\Materia;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class ArchivoService
{
    /**
     * @param  array{titulo: string, descripcion?: string|null, tipo: string}  $data
     */
    public function create(
        User $docente,
        Materia $materia,
        UploadedFile $uploadedFile,
        array $data,
    ): Archivo {
        $disk = (string) config('libros.disk');
        $directory = trim((string) config('libros.directory'), '/');
        $path = $uploadedFile->store(
            "{$directory}/{$docente->getKey()}/{$materia->getKey()}",
            $disk,
        );

        if ($path === false) {
            throw new RuntimeException('No se pudo almacenar el archivo.');
        }

        try {
            return $materia->archivos()->create([
                ...$data,
                'nombre_original' => Str::limit($uploadedFile->getClientOriginalName(), 255, ''),
                'mime_type' => Str::limit($uploadedFile->getMimeType() ?: 'application/octet-stream', 150, ''),
                'extension' => $uploadedFile->getClientOriginalExtension()
                    ? Str::limit(Str::lower($uploadedFile->getClientOriginalExtension()), 20, '')
                    : null,
                'disk' => $disk,
                'ruta' => $path,
                'tamano_bytes' => $uploadedFile->getSize(),
            ]);
        } catch (Throwable $exception) {
            Storage::disk($disk)->delete($path);

            throw $exception;
        }
    }

    /**
     * @param  array{titulo: string, descripcion?: string|null, tipo: string}  $data
     */
    public function update(Archivo $archivo, array $data): Archivo
    {
        $archivo->update($data);

        return $archivo->refresh();
    }

    public function updateStatus(Archivo $archivo, bool $isActive): Archivo
    {
        $archivo->update(['is_active' => $isActive]);

        return $archivo->refresh();
    }

    public function inlineResponse(Archivo $archivo): StreamedResponse
    {
        $disk = Storage::disk($archivo->disk);

        abort_unless($disk->exists($archivo->ruta), 404);

        return $disk->response(
            $archivo->ruta,
            $archivo->nombre_original,
            [
                'Content-Type' => $archivo->mime_type,
                'Cache-Control' => 'private, no-store, max-age=0',
                'Pragma' => 'no-cache',
                'X-Content-Type-Options' => 'nosniff',
            ],
        );
    }
}
