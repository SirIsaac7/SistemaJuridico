<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return ($this->user()?->can('create', User::class) ?? false)
            && ($this->user()?->can('usuarios.asignar-roles') ?? false);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', Rule::unique(User::class)],
            'password' => ['required', 'confirmed', Password::defaults()],
            'role_id' => ['required', 'integer', Rule::exists(config('permission.table_names.roles'), 'id')->where('guard_name', 'web')],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Escribe el nombre del usuario.',
            'email.required' => 'Escribe el correo electrónico.',
            'email.email' => 'Escribe un correo electrónico válido.',
            'email.unique' => 'Ya existe un usuario con ese correo electrónico.',
            'password.required' => 'Escribe una contraseña.',
            'password.confirmed' => 'Las contraseñas no coinciden.',
            'role_id.required' => 'Selecciona un rol.',
            'role_id.exists' => 'El rol seleccionado no está disponible.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'email' => Str::lower(trim((string) $this->input('email'))),
        ]);
    }
}
