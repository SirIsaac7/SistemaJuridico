<?php

namespace App\Http\Requests\Libros;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class IndexLibroRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('libros.ver') ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'ambito' => ['nullable', 'string', 'in:todas,impartidas,concedidas'],
            'buscar' => ['nullable', 'string', 'max:100'],
            'estado' => ['nullable', 'string', 'in:activas,inactivas,todas'],
        ];
    }
}
