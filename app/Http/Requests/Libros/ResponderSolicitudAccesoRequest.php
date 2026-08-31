<?php

namespace App\Http\Requests\Libros;

use App\Models\SolicitudAcceso;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ResponderSolicitudAccesoRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $solicitud = $this->route('solicitud');

        return $solicitud instanceof SolicitudAcceso
            && ($this->user()?->can('respond', $solicitud) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'estado' => [
                'required',
                'string',
                Rule::in([
                    SolicitudAcceso::ESTADO_ACEPTADA,
                    SolicitudAcceso::ESTADO_RECHAZADA,
                ]),
            ],
            'motivo_respuesta' => [
                Rule::requiredIf($this->input('estado') === SolicitudAcceso::ESTADO_RECHAZADA),
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'estado.required' => 'Selecciona una respuesta para la solicitud.',
            'estado.in' => 'La respuesta debe ser aceptada o rechazada.',
            'motivo_respuesta.required' => 'Indica el motivo del rechazo.',
            'motivo_respuesta.max' => 'El motivo no puede superar los 2000 caracteres.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'estado' => Str::lower(trim((string) $this->input('estado'))),
            'motivo_respuesta' => $this->filled('motivo_respuesta')
                ? trim((string) $this->input('motivo_respuesta'))
                : null,
        ]);
    }
}
