<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UpdateRoleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $role = $this->route('role');

        return $role instanceof Role && ($this->user()?->can('update', $role) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:100',
                'regex:/^[\pL\pN]+(?:[\s-][\pL\pN]+)*$/u',
                Rule::unique(config('permission.table_names.roles'), 'name')
                    ->where('guard_name', 'web')
                    ->ignore($this->route('role')),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Escribe el nombre del rol.',
            'name.max' => 'El nombre del rol no puede superar los 100 caracteres.',
            'name.regex' => 'Usa letras, números, espacios o guiones en el nombre del rol.',
            'name.unique' => 'Ya existe un rol con ese nombre.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(['name' => Str::slug(trim((string) $this->input('name')))]);
    }
}
