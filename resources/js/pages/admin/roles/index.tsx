import { Can } from '@/components/can';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RoleFormDialog } from '@/features/roles/components/role-form-dialog';
import AppLayout from '@/layouts/app-layout';
import { confirmAction } from '@/lib/sweet-alert';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { KeyRound, Pencil, Plus, Search, ShieldCheck, Trash2, Users } from 'lucide-react';
import { useMemo, useState } from 'react';

interface RoleSummary {
    id: number;
    name: string;
    permissions_count: number;
    users_count: number;
    created_at: string | null;
    is_protected: boolean;
    can: {
        update: boolean;
        delete: boolean;
        assign_permissions: boolean;
    };
}

interface RolesIndexProps {
    roles: RoleSummary[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Roles y permisos', href: '/roles' },
];

function readableRoleName(name: string): string {
    return name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function RolesIndex({ roles }: RolesIndexProps) {
    const [search, setSearch] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingRole, setEditingRole] = useState<RoleSummary | null>(null);

    const filteredRoles = useMemo(() => {
        const term = search.trim().toLocaleLowerCase();
        return term ? roles.filter((role) => readableRoleName(role.name).toLocaleLowerCase().includes(term)) : roles;
    }, [roles, search]);

    function openCreateDialog() {
        setEditingRole(null);
        setDialogOpen(true);
    }

    function openEditDialog(role: RoleSummary) {
        setEditingRole(role);
        setDialogOpen(true);
    }

    async function deleteRole(role: RoleSummary) {
        const confirmed = await confirmAction({
            title: 'Eliminar rol',
            text: `Se eliminará el rol ${readableRoleName(role.name)}. Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar rol',
            icon: 'warning',
            tone: 'danger',
        });

        if (!confirmed) {
            return;
        }

        router.delete(`/roles/${role.id}`, {
            preserveScroll: true,
        });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Roles y permisos" />

            <main className="flex flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-[#5d87ff]">
                            <ShieldCheck className="size-4" />
                            Control de acceso
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-[#2a3547] sm:text-3xl dark:text-white">Roles y permisos</h1>
                        <p className="max-w-2xl text-sm text-[#5a6a85] dark:text-[#aab7ca]">Decide qué puede hacer cada tipo de usuario.</p>
                    </div>

                    <Can permission="roles.crear">
                        <Button onClick={openCreateDialog} className="h-11 bg-[#5d87ff] px-5 text-white shadow-sm hover:bg-[#4d76e8]">
                            <Plus className="size-4" />
                            Crear rol
                        </Button>
                    </Can>
                </section>

                <section className="overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                    <div className="flex flex-col justify-between gap-4 border-b border-[#e5eaf2] px-5 py-5 sm:flex-row sm:items-center sm:px-7 dark:border-[#2e3a50]">
                        <div>
                            <h2 className="text-lg font-semibold text-[#2a3547] dark:text-white">Listado de roles</h2>
                            <p className="mt-1 text-sm text-[#7c8fac]">{roles.length === 1 ? '1 rol' : `${roles.length} roles`}</p>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7c8fac]" />
                            <Input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar rol..."
                                className="h-10 border-[#dfe5ef] pl-9 dark:border-[#3a465c]"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[820px] text-left">
                            <thead className="bg-[#f7f9fc] text-xs font-semibold tracking-wide text-[#5a6a85] uppercase dark:bg-[#253047] dark:text-[#aab7ca]">
                                <tr>
                                    <th className="px-7 py-4">Rol</th>
                                    <th className="px-5 py-4">Permisos</th>
                                    <th className="px-5 py-4">Usuarios</th>
                                    <th className="px-5 py-4">Fecha y hora</th>
                                    <th className="px-7 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#e5eaf2] dark:divide-[#2e3a50]">
                                {filteredRoles.map((role) => (
                                    <tr key={role.id} className="transition-colors hover:bg-[#f8faff] dark:hover:bg-[#253047]/70">
                                        <td className="px-7 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="flex size-10 items-center justify-center rounded-full bg-[#5d87ff]/12 text-[#5d87ff]">
                                                    <ShieldCheck className="size-5" />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-semibold text-[#2a3547] dark:text-white">
                                                        {readableRoleName(role.name)}
                                                    </span>
                                                    {role.is_protected && (
                                                        <Badge className="w-fit border-0 bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/15 dark:text-amber-300">
                                                            Protegido
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-5">
                                            <span className="inline-flex items-center gap-2 text-sm text-[#5a6a85] dark:text-[#aab7ca]">
                                                <KeyRound className="size-4 text-[#49beff]" />
                                                {role.is_protected
                                                    ? 'Acceso total'
                                                    : role.permissions_count === 1
                                                      ? '1 permiso'
                                                      : `${role.permissions_count} permisos`}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5">
                                            <span className="inline-flex items-center gap-2 text-sm text-[#5a6a85] dark:text-[#aab7ca]">
                                                <Users className="size-4 text-[#13deb9]" />
                                                {role.users_count}
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 text-sm text-[#5a6a85] dark:text-[#aab7ca]">{role.created_at ?? '—'}</td>
                                        <td className="px-7 py-5">
                                            <div className="flex justify-end gap-1">
                                                {role.can.assign_permissions && (
                                                    <Button
                                                        asChild
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-[#5d87ff] hover:bg-[#5d87ff]/10 hover:text-[#5d87ff]"
                                                    >
                                                        <Link href={`/roles/${role.id}/permissions`} prefetch>
                                                            <KeyRound className="size-4" />
                                                            Permisos
                                                        </Link>
                                                    </Button>
                                                )}
                                                {role.can.update && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => openEditDialog(role)}
                                                        className="text-[#2a3547] hover:bg-[#eef2f7] hover:text-[#2a3547] dark:text-[#d5deec] dark:hover:bg-[#2e3a50]"
                                                    >
                                                        <Pencil className="size-4" /> Editar
                                                    </Button>
                                                )}
                                                {role.can.delete && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => void deleteRole(role)}
                                                        className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40"
                                                    >
                                                        <Trash2 className="size-4" /> Eliminar
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredRoles.length === 0 && (
                        <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                            <div className="flex size-12 items-center justify-center rounded-full bg-[#5d87ff]/10 text-[#5d87ff]">
                                <Search className="size-5" />
                            </div>
                            <p className="font-semibold text-[#2a3547] dark:text-white">No encontramos roles</p>
                            <p className="text-sm text-[#7c8fac]">Prueba con otra búsqueda.</p>
                        </div>
                    )}
                </section>
            </main>

            {dialogOpen && <RoleFormDialog key={editingRole?.id ?? 'create'} open={dialogOpen} onOpenChange={setDialogOpen} role={editingRole} />}
        </AppLayout>
    );
}
