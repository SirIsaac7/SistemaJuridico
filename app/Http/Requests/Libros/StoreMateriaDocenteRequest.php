<?php

namespace App\Http\Requests\Libros;

use App\Models\Materia;
use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreMateriaDocenteRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('createForTeacher', Materia::class) ?? false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'docente_id' => ['required', 'integer', Rule::exists('users', 'id')],
            'nombre' => [
                'required',
                'string',
                'max:255',
                Rule::unique('materias', 'nombre')
                    ->where('docente_id', $this->integer('docente_id')),
            ],
            'descripcion' => ['nullable', 'string', 'max:5000'],
        ];
    }

    /** @return array<int, callable(Validator): void> */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                if ($validator->errors()->has('docente_id')) {
                    return;
                }

                $docente = User::query()->find($this->integer('docente_id'));

                if (! $docente?->is_active || ! $docente->hasRole(config('access_control.docente_role'))) {
                    $validator->errors()->add('docente_id', 'Selecciona un usuario docente activo.');
                }
            },
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'docente_id.required' => 'Selecciona el docente responsable.',
            'docente_id.exists' => 'El docente seleccionado no existe.',
            'nombre.required' => 'Escribe el nombre de la materia.',
            'nombre.unique' => 'El docente ya tiene una materia con ese nombre.',
            'nombre.max' => 'El nombre no puede superar los 255 caracteres.',
            'descripcion.max' => 'La descripción no puede superar los 5000 caracteres.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'nombre' => Str::squish((string) $this->input('nombre')),
            'descripcion' => $this->filled('descripcion')
                ? trim((string) $this->input('descripcion'))
                : null,
        ]);
    }
}
