<?php

namespace App\Services;

use App\Models\AccesoMateria;
use App\Models\Archivo;
use App\Models\Materia;
use App\Models\SolicitudAcceso;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;
use Spatie\Permission\Models\Role;

class DashboardService
{
    /**
     * @return array{cards: list<array{key: string, title: string, value: int, tone: string}>, sections: list<array{key: string, title: string, description: string, items: list<array{label: string, value: int, tone: string}>}>}
     */
    public function forUser(User $user): array
    {
        if ($user->getRoleNames()->isEmpty()) {
            return ['cards' => [], 'sections' => []];
        }

        $cards = [];
        $sections = [];

        if ($user->can('usuarios.ver')) {
            $this->addUserStatistics($cards, $sections);
        }

        if ($user->can('roles.ver')) {
            $cards[] = $this->card('roles', 'Roles configurados', Role::query()->count(), 'violet');
        }

        if ($user->can('libros.administracion.ver')) {
            $this->addLibraryAdministrationStatistics($cards, $sections);
        } else {
            $this->addOwnedTeachingStatistics($user, $cards, $sections);
            $this->addStudentStatistics($user, $cards, $sections);
        }

        return compact('cards', 'sections');
    }

    /**
     * @param  list<array{key: string, title: string, value: int, tone: string}>  $cards
     * @param  list<array{key: string, title: string, description: string, items: list<array{label: string, value: int, tone: string}>}>  $sections
     */
    private function addUserStatistics(array &$cards, array &$sections): void
    {
        $total = User::query()->count();
        $active = User::query()->where('is_active', true)->count();
        $withRole = User::query()->whereHas('roles')->count();

        $cards[] = $this->card('usuarios', 'Usuarios', $total, 'blue');
        $cards[] = $this->card('usuarios-activos', 'Usuarios activos', $active, 'green');
        $sections[] = $this->section(
            'usuarios',
            'Estado de usuarios',
            'Distribución actual de las cuentas registradas.',
            [
                $this->item('Activos', $active, 'green'),
                $this->item('Inactivos', max(0, $total - $active), 'red'),
                $this->item('Con rol asignado', $withRole, 'blue'),
                $this->item('Sin rol asignado', max(0, $total - $withRole), 'amber'),
            ],
        );
    }

    /**
     * @param  list<array{key: string, title: string, value: int, tone: string}>  $cards
     * @param  list<array{key: string, title: string, description: string, items: list<array{label: string, value: int, tone: string}>}>  $sections
     */
    private function addLibraryAdministrationStatistics(array &$cards, array &$sections): void
    {
        $materias = Materia::query()->count();
        $materiasActivas = Materia::query()->activas()->count();
        $archivos = Archivo::query()->count();
        $archivosActivos = Archivo::query()->activos()->count();
        $solicitudes = $this->requestCounts(SolicitudAcceso::query());
        $accesos = AccesoMateria::query()->vigentes()->count();

        $cards[] = $this->card('materias', 'Materias', $materias, 'cyan');
        $cards[] = $this->card('archivos', 'Archivos activos', $archivosActivos, 'violet');
        $cards[] = $this->card('solicitudes', 'Solicitudes pendientes', $solicitudes['pendiente'], 'amber');
        $cards[] = $this->card('accesos', 'Accesos vigentes', $accesos, 'green');

        $sections[] = $this->section(
            'biblioteca',
            'Resumen de biblioteca',
            'Estado global de materias, archivos y accesos concedidos.',
            [
                $this->item('Materias activas', $materiasActivas, 'blue'),
                $this->item('Materias inactivas', max(0, $materias - $materiasActivas), 'slate'),
                $this->item('Archivos activos', $archivosActivos, 'violet'),
                $this->item('Archivos inactivos', max(0, $archivos - $archivosActivos), 'slate'),
                $this->item('Accesos vigentes', $accesos, 'green'),
            ],
        );
        $sections[] = $this->requestSection('solicitudes-globales', 'Solicitudes de acceso', $solicitudes);
    }

    /**
     * @param  list<array{key: string, title: string, value: int, tone: string}>  $cards
     * @param  list<array{key: string, title: string, description: string, items: list<array{label: string, value: int, tone: string}>}>  $sections
     */
    private function addOwnedTeachingStatistics(User $user, array &$cards, array &$sections): void
    {
        if ($user->can('libros.materias.ver')) {
            $materias = Materia::query()->delDocente($user)->count();
            $materiasActivas = Materia::query()->delDocente($user)->activas()->count();
            $archivos = Archivo::query()
                ->whereHas('materia', fn (Builder $query): Builder => $query->whereBelongsTo($user, 'docente'))
                ->count();
            $archivosActivos = Archivo::query()
                ->activos()
                ->whereHas('materia', fn (Builder $query): Builder => $query->whereBelongsTo($user, 'docente'))
                ->count();

            $cards[] = $this->card('mis-materias', 'Mis materias', $materias, 'blue');

            if ($user->can('libros.archivos.ver')) {
                $cards[] = $this->card('mis-archivos', 'Mis archivos activos', $archivosActivos, 'cyan');
            }

            $items = [
                $this->item('Materias activas', $materiasActivas, 'blue'),
                $this->item('Materias inactivas', max(0, $materias - $materiasActivas), 'slate'),
            ];

            if ($user->can('libros.archivos.ver')) {
                $items[] = $this->item('Archivos activos', $archivosActivos, 'cyan');
                $items[] = $this->item('Archivos inactivos', max(0, $archivos - $archivosActivos), 'slate');
            }

            $sections[] = $this->section('docencia', 'Mi contenido académico', 'Resumen de las materias y archivos bajo tu responsabilidad.', $items);
        }

        if ($user->can('libros.solicitudes.ver-recibidas')) {
            $requests = $this->requestCounts(SolicitudAcceso::query()->paraDocente($user));
            $cards[] = $this->card('solicitudes-recibidas', 'Solicitudes pendientes', $requests['pendiente'], 'amber');
            $sections[] = $this->requestSection('solicitudes-recibidas', 'Solicitudes recibidas', $requests);
        }
    }

    /**
     * @param  list<array{key: string, title: string, value: int, tone: string}>  $cards
     * @param  list<array{key: string, title: string, description: string, items: list<array{label: string, value: int, tone: string}>}>  $sections
     */
    private function addStudentStatistics(User $user, array &$cards, array &$sections): void
    {
        if ($user->can('libros.catalogo.ver')) {
            $cards[] = $this->card('catalogo', 'Materias en catálogo', Materia::query()->activas()->count(), 'violet');
        }

        if ($user->can('libros.accesos.ver-propios')) {
            $cards[] = $this->card('mis-accesos', 'Materias disponibles', AccesoMateria::query()->delUsuario($user)->vigentes()->count(), 'green');
        }

        if ($user->can('libros.solicitudes.ver-propias')) {
            $requests = $this->requestCounts(SolicitudAcceso::query()->delUsuario($user));
            $cards[] = $this->card('mis-solicitudes', 'Mis solicitudes pendientes', $requests['pendiente'], 'amber');
            $sections[] = $this->requestSection('mis-solicitudes', 'Mis solicitudes', $requests);
        }
    }

    /** @return array{pendiente: int, aceptada: int, rechazada: int} */
    private function requestCounts(Builder $query): array
    {
        $counts = $query
            ->selectRaw('estado, COUNT(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        return [
            'pendiente' => (int) $counts->get(SolicitudAcceso::ESTADO_PENDIENTE, 0),
            'aceptada' => (int) $counts->get(SolicitudAcceso::ESTADO_ACEPTADA, 0),
            'rechazada' => (int) $counts->get(SolicitudAcceso::ESTADO_RECHAZADA, 0),
        ];
    }

    /** @return array{key: string, title: string, value: int, tone: string} */
    private function card(string $key, string $title, int $value, string $tone): array
    {
        return compact('key', 'title', 'value', 'tone');
    }

    /** @return array{label: string, value: int, tone: string} */
    private function item(string $label, int $value, string $tone): array
    {
        return compact('label', 'value', 'tone');
    }

    /**
     * @param  list<array{label: string, value: int, tone: string}>  $items
     * @return array{key: string, title: string, description: string, items: list<array{label: string, value: int, tone: string}>}
     */
    private function section(string $key, string $title, string $description, array $items): array
    {
        return compact('key', 'title', 'description', 'items');
    }

    /**
     * @param  array{pendiente: int, aceptada: int, rechazada: int}  $counts
     * @return array{key: string, title: string, description: string, items: list<array{label: string, value: int, tone: string}>}
     */
    private function requestSection(string $key, string $title, array $counts): array
    {
        return $this->section($key, $title, 'Estado de las solicitudes de acceso a materias.', [
            $this->item('Pendientes', $counts['pendiente'], 'amber'),
            $this->item('Aceptadas', $counts['aceptada'], 'green'),
            $this->item('Rechazadas', $counts['rechazada'], 'red'),
        ]);
    }
}
