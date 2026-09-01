<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, HasRoles, Notifiable, SoftDeletes;

    /**
     * @var array<string, mixed>
     */
    protected $attributes = [
        'is_active' => true,
    ];

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'is_active' => 'boolean',
            'password' => 'hashed',
        ];
    }

    public function isSuperAdministrator(): bool
    {
        return $this->hasRole(config('access_control.super_admin_role'));
    }

    public function isOnlySuperAdministrator(): bool
    {
        return $this->isSuperAdministrator()
            && self::role(config('access_control.super_admin_role'))->count() === 1;
    }

    public function materiasImpartidas(): HasMany
    {
        return $this->hasMany(Materia::class, 'docente_id');
    }

    public function solicitudesAcceso(): HasMany
    {
        return $this->hasMany(SolicitudAcceso::class, 'usuario_id');
    }

    public function solicitudesRespondidas(): HasMany
    {
        return $this->hasMany(SolicitudAcceso::class, 'respondido_por');
    }

    public function accesosMaterias(): HasMany
    {
        return $this->hasMany(AccesoMateria::class, 'usuario_id');
    }

    public function dispositivos(): HasMany
    {
        return $this->hasMany(DispositivoUsuario::class, 'usuario_id');
    }

    public function dispositivoActivo(): HasOne
    {
        return $this->hasOne(DispositivoUsuario::class, 'usuario_id')
            ->where('estado', DispositivoUsuario::ESTADO_ACTIVO)
            ->latestOfMany('fecha_vinculacion');
    }
}
