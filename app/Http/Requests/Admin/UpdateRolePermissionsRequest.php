<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

class UpdateRolePermissionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $role = $this->route('role');

        return $role instanceof Role && ($this->user()?->can('assignPermissions', $role) ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'permissions' => ['present', 'array'],
            'permissions.*' => [
                'string',
                'distinct',
                Rule::exists(config('permission.table_names.permissions'), 'name')
                    ->where('guard_name', 'web'),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'permissions.present' => 'Envía la selección de permisos.',
            'permissions.array' => 'La selección de permisos no es válida.',
            'permissions.*.exists' => 'Uno de los permisos seleccionados no existe.',
            'permissions.*.distinct' => 'No se puede seleccionar un permiso más de una vez.',
        ];
    }
}
