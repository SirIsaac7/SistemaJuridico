<?php

namespace App\Services\Libros;

use App\Models\Archivo;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ProtectedFileResponseService
{
    public function make(Request $request, Archivo $archivo): Response
    {
        if ($archivo->tipo === Archivo::TIPO_IMAGEN) {
            return $this->watermarkedImage($archivo);
        }

        return $this->rangeResponse($request, $archivo);
    }

    private function watermarkedImage(Archivo $archivo): Response
    {
        abort_unless(extension_loaded('gd'), 503, 'La vista protegida de imágenes no está disponible en este servidor.');

        $disk = Storage::disk($archivo->disk);
        abort_unless($disk->exists($archivo->ruta), 404);

        $contents = $disk->get($archivo->ruta);
        $source = @imagecreatefromstring($contents);
        abort_unless($source !== false, 422, 'No se pudo procesar la imagen.');

        $sourceWidth = imagesx($source);
        $sourceHeight = imagesy($source);
        $maxWidth = (int) config('libros.student_preview.image_max_width', 1800);
        $maxHeight = (int) config('libros.student_preview.image_max_height', 1800);
        $scale = min(1, $maxWidth / $sourceWidth, $maxHeight / $sourceHeight);
        $width = max(1, (int) round($sourceWidth * $scale));
        $height = max(1, (int) round($sourceHeight * $scale));

        $preview = imagecreatetruecolor($width, $height);
        $background = imagecolorallocate($preview, 255, 255, 255);
        imagefill($preview, 0, 0, $background);
        imagecopyresampled($preview, $source, 0, 0, 0, 0, $width, $height, $sourceWidth, $sourceHeight);
        imagedestroy($source);

        $watermark = 'Documento protegido - Sistema Juridico | Contenido de uso personal';
        $color = imagecolorallocatealpha($preview, 35, 45, 65, 72);
        $stepX = max(260, strlen($watermark) * imagefontwidth(3) + 90);

        for ($y = 35; $y < $height; $y += 120) {
            $offset = ((int) floor($y / 120) % 2) * (int) ($stepX / 2);
            for ($x = -$offset; $x < $width; $x += $stepX) {
                imagestring($preview, 3, $x, $y, $watermark, $color);
            }
        }

        ob_start();
        imagewebp($preview, null, (int) config('libros.student_preview.image_quality', 80));
        $output = (string) ob_get_clean();
        imagedestroy($preview);

        return response($output, 200, $this->headers('image/webp', strlen($output)));
    }

    private function rangeResponse(Request $request, Archivo $archivo): StreamedResponse
    {
        $disk = Storage::disk($archivo->disk);
        abort_unless($disk->exists($archivo->ruta), 404);

        $size = $disk->size($archivo->ruta);
        [$start, $end, $status] = $this->requestedRange($request, $size);
        $length = $end - $start + 1;
        $headers = $this->headers($archivo->mime_type, $length) + ['Accept-Ranges' => 'bytes'];

        if ($status === 206) {
            $headers['Content-Range'] = "bytes {$start}-{$end}/{$size}";
        }

        return response()->stream(function () use ($disk, $archivo, $start, $length): void {
            $stream = $disk->readStream($archivo->ruta);
            abort_unless(is_resource($stream), 404);

            if ($start > 0 && fseek($stream, $start) !== 0) {
                $remainingToSkip = $start;
                while ($remainingToSkip > 0 && ! feof($stream)) {
                    $chunk = fread($stream, min(8192, $remainingToSkip));
                    if ($chunk === false || $chunk === '') {
                        break;
                    }
                    $remainingToSkip -= strlen($chunk);
                }
            }

            $remaining = $length;
            while ($remaining > 0 && ! feof($stream)) {
                $chunk = fread($stream, min(8192, $remaining));
                if ($chunk === false || $chunk === '') {
                    break;
                }
                echo $chunk;
                $remaining -= strlen($chunk);
            }

            fclose($stream);
        }, $status, $headers);
    }

    /** @return array{int, int, int} */
    private function requestedRange(Request $request, int $size): array
    {
        $range = $request->header('Range');
        if (! is_string($range) || ! preg_match('/^bytes=(\d*)-(\d*)$/', $range, $matches)) {
            return [0, max(0, $size - 1), 200];
        }

        if ($matches[1] === '' && $matches[2] === '') {
            return [0, max(0, $size - 1), 200];
        }

        if ($matches[1] === '') {
            $suffixLength = min((int) $matches[2], $size);
            $start = max(0, $size - $suffixLength);
            $end = max(0, $size - 1);
        } else {
            $start = (int) $matches[1];
            $end = $matches[2] === '' ? max(0, $size - 1) : min((int) $matches[2], max(0, $size - 1));
        }

        abort_if($size < 1 || $start >= $size || $start > $end, 416, 'Rango no válido.');

        return [$start, $end, 206];
    }

    /** @return array<string, string|int> */
    private function headers(string $mimeType, int $contentLength): array
    {
        return [
            'Content-Type' => $mimeType,
            'Content-Length' => $contentLength,
            'Content-Disposition' => 'inline; filename="visualizacion"',
            'Cache-Control' => 'private, no-store, max-age=0',
            'Pragma' => 'no-cache',
            'X-Content-Type-Options' => 'nosniff',
            'X-Robots-Tag' => 'noindex, nofollow, noarchive',
        ];
    }
}
