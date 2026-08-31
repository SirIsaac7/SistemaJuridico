<?php

namespace App\Http\Requests\Libros;

use App\Models\Archivo;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateArchivoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $archivo = $this->route('archivo');

        return $archivo instanceof Archivo
            && ($this->user()?->can('update', $archivo) ?? false);
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
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'Escribe el título del archivo.',
            'titulo.max' => 'El título no puede superar los 255 caracteres.',
            'descripcion.max' => 'La descripción no puede superar los 5000 caracteres.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'titulo' => Str::squish((string) $this->input('titulo')),
            'descripcion' => $this->filled('descripcion')
                ? trim((string) $this->input('descripcion'))
                : null,
        ]);
    }
}
