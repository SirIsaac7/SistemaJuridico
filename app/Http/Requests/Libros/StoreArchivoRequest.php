<?php

namespace App\Http\Requests\Libros;

use App\Models\Archivo;
use App\Models\Materia;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreArchivoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $materia = $this->route('materia');

        return $materia instanceof Materia
            && ($this->user()?->can('create', [Archivo::class, $materia]) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['nullable', 'string', 'max:5000'],
            'tipo' => ['required', 'string', Rule::in(Archivo::TIPOS)],
            'archivo' => [
                'required',
                'file',
                'max:'.config('libros.max_upload_size_kb'),
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'Escribe el título del archivo.',
            'titulo.max' => 'El título no puede superar los 255 caracteres.',
            'descripcion.max' => 'La descripción no puede superar los 5000 caracteres.',
            'tipo.required' => 'Selecciona el tipo de archivo.',
            'tipo.in' => 'El tipo de archivo seleccionado no es válido.',
            'archivo.required' => 'Selecciona un archivo.',
            'archivo.file' => 'El contenido seleccionado no es un archivo válido.',
            'archivo.max' => 'El archivo supera el tamaño máximo permitido.',
        ];
    }

    /**
     * @return array<callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('archivo')) {
                    return;
                }

                $archivo = $this->file('archivo');

                if (! $archivo instanceof UploadedFile) {
                    return;
                }

                $extension = Str::lower($archivo->getClientOriginalExtension());
                $mimeType = Str::lower((string) $archivo->getMimeType());

                if (in_array($extension, config('libros.prohibited_extensions'), true)
                    || in_array($mimeType, config('libros.prohibited_mime_types'), true)) {
                    $validator->errors()->add(
                        'archivo',
                        'Este tipo de archivo está bloqueado por seguridad.',
                    );
                }
            },
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'titulo' => Str::squish((string) $this->input('titulo')),
            'descripcion' => $this->filled('descripcion')
                ? trim((string) $this->input('descripcion'))
                : null,
            'tipo' => Str::lower(trim((string) $this->input('tipo'))),
        ]);
    }
}
