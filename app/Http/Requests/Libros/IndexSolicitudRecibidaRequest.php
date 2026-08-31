<?php

namespace App\Http\Requests\Libros;

use App\Models\SolicitudAcceso;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class IndexSolicitudRecibidaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('viewReceivedAny', SolicitudAcceso::class) ?? false;
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
                'nullable',
                'string',
                Rule::in([
                    SolicitudAcceso::ESTADO_PENDIENTE,
                    SolicitudAcceso::ESTADO_ACEPTADA,
                    SolicitudAcceso::ESTADO_RECHAZADA,
                ]),
            ],
        ];
    }
}
