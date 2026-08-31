<?php

namespace App\Http\Requests\Libros;

use App\Models\Materia;
use App\Models\SolicitudAcceso;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreSolicitudAccesoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $materia = $this->route('materia');

        return $materia instanceof Materia
            && ($this->user()?->can('create', [SolicitudAcceso::class, $materia]) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'universidad' => ['required', 'string', 'max:255'],
            'observacion' => ['nullable', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'universidad.required' => 'Escribe el nombre de tu universidad.',
            'universidad.max' => 'El nombre de la universidad no puede superar los 255 caracteres.',
            'observacion.max' => 'La observación no puede superar los 2000 caracteres.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'universidad' => Str::squish((string) $this->input('universidad')),
            'observacion' => $this->filled('observacion')
                ? trim((string) $this->input('observacion'))
                : null,
        ]);
    }
}
