import { Can } from '@/components/can';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserFormDialog } from '@/features/users/components/user-form-dialog';
import { UserSectionTabs } from '@/features/users/components/user-section-tabs';
import { type ManagedUser, type UserRoleOption } from '@/features/users/types';
import AppLayout from '@/layouts/app-layout';
import { confirmAction } from '@/lib/sweet-alert';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArchiveRestore,
    Ban,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    LoaderCircle,
    MonitorSmartphone,
    Pencil,
    Plus,
    RotateCcw,
    Search,
    Trash2,
    UserRoundCheck,
    UsersRound,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface PaginatedUsers {
    data: ManagedUser[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface UserFilters {
    search: string;
    status: 'all' | 'active' | 'blocked' | 'deleted';
    role: number | null;
}

interface UserCounts {
    all: number;
    active: number;
    blocked: number;
    deleted: number;
}

interface UsersIndexProps {
    users: PaginatedUsers;
    roles: UserRoleOption[];
    filters: UserFilters;
    counts: UserCounts;
}

type UserAction = 'delete' | 'block' | 'activate' | 'restore' | 'reset_device';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios', href: '/users' },
];

const roleColors = [
    'bg-violet-100 text-violet-700',
    'bg-sky-100 text-sky-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
];

function readableRoleName(name: string): string {
    return name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function UsersIndex({ users, roles, filters, counts }: UsersIndexProps) {
    const [search, setSearch] = useState(filters.search);
    const [formOpen, setFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
    const [processingUserId, setProcessingUserId] = useState<number | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const normalizedSearch = search.trim();

        if (normalizedSearch === filters.search) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                '/users',
                {
                    search: normalizedSearch || undefined,
                    status: filters.status === 'all' ? undefined : filters.status,
                    role: filters.role || undefined,
                },
                {
                    only: ['users', 'filters', 'counts'],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onStart: () => setIsSearching(true),
                    onFinish: () => setIsSearching(false),
                },
            );
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [filters.role, filters.search, filters.status, search]);

    function visit(nextFilters: Partial<UserFilters>) {
        const next = { ...filters, search: search.trim(), ...nextFilters };

        router.get(
            '/users',
            {
                search: next.search || undefined,
                status: next.status === 'all' ? undefined : next.status,
                role: next.role || undefined,
            },
            {
                only: ['users', 'filters', 'counts'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setIsSearching(true),
                onFinish: () => setIsSearching(false),
            },
        );
    }

    function clearSearch() {
        setSearch('');
    }

    function openCreateDialog() {
        setEditingUser(null);
        setFormOpen(true);
    }

    function openEditDialog(user: ManagedUser) {
        setEditingUser(user);
        setFormOpen(true);
    }

    async function executeAction(type: UserAction, user: ManagedUser) {
        const confirmation = {
            delete: {
                title: 'Enviar a la papelera',
                text: `La cuenta de ${user.name} dejará de aparecer entre los usuarios activos. Podrás restaurarla después.`,
                confirmText: 'Enviar a papelera',
                icon: 'warning' as const,
                tone: 'danger' as const,
            },
            block: {
                title: 'Bloquear acceso',
                text: `${user.name} no podrá ingresar al sistema hasta que vuelvas a activar su cuenta.`,
                confirmText: 'Bloquear acceso',
                icon: 'warning' as const,
                tone: 'danger' as const,
            },
            activate: {
                title: 'Activar acceso',
                text: `${user.name} podrá volver a ingresar al sistema con sus credenciales.`,
                confirmText: 'Activar acceso',
                icon: 'question' as const,
                tone: 'success' as const,
            },
            restore: {
                title: 'Restaurar usuario',
                text: `${user.name} volverá al listado de usuarios. Su acceso conservará el estado que tenía antes.`,
                confirmText: 'Restaurar usuario',
                icon: 'question' as const,
                tone: 'primary' as const,
            },
            reset_device: {
                title: 'Resetear dispositivo',
                text: `Se desvinculará el navegador autorizado de ${user.name} y se cerrarán todas sus sesiones activas. El historial no será eliminado.`,
                confirmText: 'Resetear dispositivo',
                icon: 'warning' as const,
                tone: 'danger' as const,
            },
        }[type];

        if (!(await confirmAction(confirmation))) {
            return;
        }

        const finish = {
            preserveScroll: true,
            onStart: () => setProcessingUserId(user.id),
            onFinish: () => setProcessingUserId(null),
        };

        if (type === 'delete') {
            router.delete(`/users/${user.id}`, finish);
            return;
        }

        if (type === 'restore') {
            router.put(`/deleted-users/${user.id}`, {}, finish);
            return;
        }

        if (type === 'reset_device') {
            router.put(`/users/${user.id}/device/reset`, {}, finish);
            return;
        }

        router.put(`/users/${user.id}/status`, { is_active: type === 'activate' }, finish);
    }

    const statusFilters: Array<{ key: UserFilters['status']; label: string; count: number }> = [
        { key: 'all', label: 'Todos', count: counts.all },
        { key: 'active', label: 'Activos', count: counts.active },
        { key: 'blocked', label: 'Bloqueados', count: counts.blocked },
        { key: 'deleted', label: 'Papelera', count: counts.deleted },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Usuarios" />

            <main className="flex min-w-0 flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#5d87ff]">
                            <UsersRound className="size-4" />
                            Administración
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#2a3547] sm:text-3xl dark:text-white">Usuarios</h1>
                        <p className="text-sm text-[#5a6a85] dark:text-[#aab7ca]">Administra quién puede ingresar y qué rol tiene.</p>
                    </div>

                    <Can permission="usuarios.crear">
                        <Button onClick={openCreateDialog} className="h-11 bg-[#5d87ff] px-5 text-white shadow-sm hover:bg-[#4d76e8]">
                            <Plus className="size-4" />
                            Crear usuario
                        </Button>
                    </Can>
                </section>

                <UserSectionTabs active="users" />

                <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                    <div className="flex flex-col gap-5 border-b border-[#e5eaf2] px-5 py-5 sm:px-7 dark:border-[#2e3a50]">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-[#2a3547] dark:text-white">Listado de usuarios</h2>
                                <p className="mt-1 text-sm text-[#7c8fac]">
                                    {users.total === 1 ? '1 usuario encontrado' : `${users.total} usuarios encontrados`}
                                </p>
                            </div>

                            <div className="relative w-full lg:w-96">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7c8fac]" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Buscar por nombre o correo..."
                                    aria-label="Buscar usuarios"
                                    className="h-10 border-[#dfe5ef] pr-9 pl-9 dark:border-[#3a465c]"
                                />
                                {isSearching ? (
                                    <LoaderCircle className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-[#5d87ff]" />
                                ) : search ? (
                                    <button
                                        type="button"
                                        onClick={clearSearch}
                                        aria-label="Limpiar búsqueda"
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#7c8fac] hover:text-[#2a3547]"
                                    >
                                        <X className="size-4" />
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {statusFilters.map((item) => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => visit({ status: item.key })}
                                        className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                                            filters.status === item.key
                                                ? 'bg-[#5d87ff] text-white shadow-sm'
                                                : 'border border-[#dfe5ef] bg-white text-[#5a6a85] hover:border-[#5d87ff]/40 hover:text-[#5d87ff] dark:border-[#344159] dark:bg-[#1c2536]'
                                        }`}
                                    >
                                        {item.label}
                                        <span className={`text-xs ${filters.status === item.key ? 'text-white/80' : 'text-[#7c8fac]'}`}>
                                            {item.count}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-1">
                                <button
                                    type="button"
                                    onClick={() => visit({ role: null })}
                                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                        filters.role === null
                                            ? 'bg-[#2a3547] text-white dark:bg-white dark:text-[#2a3547]'
                                            : 'bg-[#eef2f7] text-[#5a6a85] hover:bg-[#e5eaf2] dark:bg-[#253047] dark:text-[#aab7ca]'
                                    }`}
                                >
                                    Todos los roles
                                </button>
                                {roles.map((role) => (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => visit({ role: role.id })}
                                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                                            filters.role === role.id
                                                ? 'bg-[#5d87ff] text-white'
                                                : 'bg-[#eef2f7] text-[#5a6a85] hover:bg-[#e5eaf2] dark:bg-[#253047] dark:text-[#aab7ca]'
                                        }`}
                                    >
                                        {readableRoleName(role.name)} · {role.users_count}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
                        <table className="w-full min-w-[1320px] text-left">
                            <thead className="bg-[#f7f9fc] text-xs font-semibold tracking-wide text-[#5a6a85] uppercase dark:bg-[#253047] dark:text-[#aab7ca]">
                                <tr>
                                    <th className="px-7 py-4">Usuario</th>
                                    <th className="px-5 py-4">Rol</th>
                                    <th className="px-5 py-4">Estado</th>
                                    <th className="px-5 py-4">Dispositivo autorizado</th>
                                    <th className="px-5 py-4">{filters.status === 'deleted' ? 'Eliminado el' : 'Fecha y hora'}</th>
                                    <th className="px-7 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5eaf2] dark:divide-[#2e3a50]">
                                {users.data.map((user) => {
                                    const hasActions =
                                        user.can.update || user.can.update_status || user.can.delete || user.can.restore || user.can.reset_device;

                                    return (
                                        <tr key={user.id} className="transition-colors hover:bg-[#f8faff] dark:hover:bg-[#253047]/70">
                                            <td className="px-7 py-4">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="size-11 border-2 border-white shadow-sm">
                                                        <AvatarFallback className="bg-[#5d87ff]/12 text-sm font-bold text-[#5d87ff]">
                                                            {user.initials}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <span className="truncate font-semibold text-[#2a3547] dark:text-white">{user.name}</span>
                                                            {user.is_current_user && (
                                                                <Badge className="border-0 bg-blue-100 text-blue-700 hover:bg-blue-100">Tú</Badge>
                                                            )}
                                                        </div>
                                                        <span className="block truncate text-sm text-[#7c8fac]">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                {user.role ? (
                                                    <Badge className={`border-0 hover:opacity-100 ${roleColors[user.role.id % roleColors.length]}`}>
                                                        {readableRoleName(user.role.name)}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-sm text-[#7c8fac]">Sin rol</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {user.is_deleted ? (
                                                    <span className="inline-flex items-center gap-2 text-sm font-medium text-[#7c8fac]">
                                                        <Trash2 className="size-4" /> En papelera
                                                    </span>
                                                ) : user.is_active ? (
                                                    <span className="inline-flex items-center gap-2 text-sm font-medium text-emerald-700">
                                                        <span className="size-2 rounded-full bg-emerald-500" /> Activo
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-700">
                                                        <span className="size-2 rounded-full bg-amber-500" /> Bloqueado
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4">
                                                {user.device ? (
                                                    <div className="flex min-w-56 items-start gap-2.5 text-sm">
                                                        <MonitorSmartphone className="mt-0.5 size-4 shrink-0 text-[#5d87ff]" />
                                                        <div className="grid gap-0.5">
                                                            <span className="font-semibold text-[#2a3547] dark:text-white">
                                                                {user.device.tipo_dispositivo} · {user.device.navegador}
                                                            </span>
                                                            <span className="text-xs text-[#7c8fac]">{user.device.sistema_operativo}</span>
                                                            <span className="text-xs font-medium text-emerald-600">Estado: Activo</span>
                                                            <span className="text-xs text-[#7c8fac]">
                                                                Vinculado: {user.device.fecha_vinculacion ?? '—'}
                                                            </span>
                                                            <span className="text-xs text-[#7c8fac]">
                                                                Último acceso: {user.device.ultimo_acceso ?? '—'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-[#7c8fac]">Sin dispositivo activo</span>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-[#5a6a85] dark:text-[#aab7ca]">
                                                {user.is_deleted ? user.deleted_at : user.created_at}
                                            </td>
                                            <td className="px-7 py-4">
                                                <div className="flex justify-end gap-1 whitespace-nowrap">
                                                    {hasActions ? (
                                                        <>
                                                            {user.can.update && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => openEditDialog(user)}
                                                                    disabled={processingUserId === user.id}
                                                                    className="text-[#2a3547] hover:bg-[#eef2f7] hover:text-[#2a3547] dark:text-[#d5deec] dark:hover:bg-[#2e3a50]"
                                                                >
                                                                    <Pencil className="size-4" /> Editar
                                                                </Button>
                                                            )}
                                                            {user.can.update_status && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => void executeAction(user.is_active ? 'block' : 'activate', user)}
                                                                    disabled={processingUserId === user.id}
                                                                    className={
                                                                        user.is_active
                                                                            ? 'text-amber-700 hover:bg-amber-50 hover:text-amber-800 dark:hover:bg-amber-950/30'
                                                                            : 'text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:hover:bg-emerald-950/30'
                                                                    }
                                                                >
                                                                    {user.is_active ? (
                                                                        <Ban className="size-4" />
                                                                    ) : (
                                                                        <CheckCircle2 className="size-4" />
                                                                    )}
                                                                    {user.is_active ? 'Bloquear' : 'Activar'}
                                                                </Button>
                                                            )}
                                                            {user.can.delete && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => void executeAction('delete', user)}
                                                                    disabled={processingUserId === user.id}
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                                                                >
                                                                    <Trash2 className="size-4" /> Papelera
                                                                </Button>
                                                            )}
                                                            {user.can.restore && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => void executeAction('restore', user)}
                                                                    disabled={processingUserId === user.id}
                                                                    className="text-[#5d87ff] hover:bg-[#5d87ff]/10 hover:text-[#4d76e8]"
                                                                >
                                                                    <ArchiveRestore className="size-4" /> Restaurar
                                                                </Button>
                                                            )}
                                                            {user.can.reset_device && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => void executeAction('reset_device', user)}
                                                                    disabled={processingUserId === user.id}
                                                                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
                                                                >
                                                                    <RotateCcw className="size-4" /> Resetear dispositivo
                                                                </Button>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <span className="text-[#bdc7d8]">—</span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {users.data.length === 0 && (
                        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-[#5d87ff]/10 text-[#5d87ff]">
                                {filters.status === 'deleted' ? <ArchiveRestore className="size-6" /> : <UserRoundCheck className="size-6" />}
                            </div>
                            <p className="font-semibold text-[#2a3547] dark:text-white">
                                {filters.status === 'deleted' ? 'La papelera está vacía' : 'No encontramos usuarios'}
                            </p>
                            <p className="text-sm text-[#7c8fac]">
                                {filters.status === 'deleted'
                                    ? 'Los usuarios eliminados aparecerán aquí.'
                                    : 'Prueba con otros filtros o una búsqueda diferente.'}
                            </p>
                        </div>
                    )}

                    {users.last_page > 1 && (
                        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e5eaf2] px-5 py-4 sm:flex-row sm:px-7 dark:border-[#2e3a50]">
                            <p className="text-sm text-[#7c8fac]">
                                Mostrando {users.from}–{users.to} de {users.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button asChild={Boolean(users.prev_page_url)} variant="outline" size="sm" disabled={!users.prev_page_url}>
                                    {users.prev_page_url ? (
                                        <Link href={users.prev_page_url} preserveScroll>
                                            <ChevronLeft className="size-4" /> Anterior
                                        </Link>
                                    ) : (
                                        <span>
                                            <ChevronLeft className="size-4" /> Anterior
                                        </span>
                                    )}
                                </Button>
                                <span className="px-2 text-sm font-medium text-[#5a6a85]">
                                    {users.current_page} de {users.last_page}
                                </span>
                                <Button asChild={Boolean(users.next_page_url)} variant="outline" size="sm" disabled={!users.next_page_url}>
                                    {users.next_page_url ? (
                                        <Link href={users.next_page_url} preserveScroll>
                                            Siguiente <ChevronRight className="size-4" />
                                        </Link>
                                    ) : (
                                        <span>
                                            Siguiente <ChevronRight className="size-4" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </section>
            </main>

            {formOpen && (
                <UserFormDialog
                    key={editingUser?.id ?? 'create'}
                    open
                    roles={roles}
                    user={editingUser}
                    onOpenChange={(open) => {
                        setFormOpen(open);
                        if (!open) {
                            setEditingUser(null);
                        }
                    }}
                />
            )}
        </AppLayout>
    );
}
