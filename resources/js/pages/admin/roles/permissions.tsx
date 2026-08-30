import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, CheckCheck, KeyRound, Save, ShieldCheck } from 'lucide-react';
import { type FormEvent } from 'react';

interface PermissionItem {
    id: number;
    name: string;
    label: string;
}

interface PermissionGroup {
    key: string;
    label: string;
    description: string;
    permissions: PermissionItem[];
}

interface RoleWithPermissions {
    id: number;
    name: string;
    permissions: string[];
}

interface RolePermissionsProps {
    role: RoleWithPermissions;
    permissionGroups: PermissionGroup[];
}

function readableRoleName(name: string): string {
    return name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export default function RolePermissions({ role, permissionGroups }: RolePermissionsProps) {
    const { data, setData, put, processing, errors, isDirty } = useForm({
        permissions: role.permissions,
    });
    const allPermissions = permissionGroups.flatMap((group) => group.permissions.map((permission) => permission.name));
    const allSelected = allPermissions.length > 0 && allPermissions.every((permission) => data.permissions.includes(permission));

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Roles y permisos', href: '/roles' },
        { title: readableRoleName(role.name), href: `/roles/${role.id}/permissions` },
    ];

    function togglePermission(permission: string, checked: boolean) {
        setData('permissions', checked ? [...new Set([...data.permissions, permission])] : data.permissions.filter((item) => item !== permission));
    }

    function toggleGroup(group: PermissionGroup, checked: boolean) {
        const groupPermissions = group.permissions.map((permission) => permission.name);
        setData(
            'permissions',
            checked
                ? [...new Set([...data.permissions, ...groupPermissions])]
                : data.permissions.filter((permission) => !groupPermissions.includes(permission)),
        );
    }

    function toggleAll(checked: boolean) {
        setData('permissions', checked ? allPermissions : []);
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        put(`/roles/${role.id}/permissions`, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Permisos de ${readableRoleName(role.name)}`} />

            <main className="flex flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <section className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                    <div className="flex flex-col gap-3">
                        <Button asChild variant="ghost" className="w-fit px-0 text-[#5d87ff] hover:bg-transparent hover:text-[#4d76e8]">
                            <Link href="/roles" prefetch>
                                <ArrowLeft className="size-4" />
                                Volver a roles
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="flex size-12 items-center justify-center rounded-xl bg-[#5d87ff]/12 text-[#5d87ff]">
                                <ShieldCheck className="size-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-[#7c8fac]">Permisos del rol</p>
                                <h1 className="text-2xl font-bold tracking-tight text-[#2a3547] sm:text-3xl dark:text-white">
                                    {readableRoleName(role.name)}
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-[#dfe5ef] bg-white px-4 py-3 text-sm text-[#5a6a85] shadow-sm dark:border-[#344159] dark:bg-[#1c2536] dark:text-[#aab7ca]">
                        <span className="font-semibold text-[#2a3547] dark:text-white">{data.permissions.length}</span> de {allPermissions.length}{' '}
                        permisos seleccionados
                    </div>
                </section>

                <form onSubmit={submit} className="flex flex-col gap-5">
                    <section className="flex flex-col justify-between gap-4 rounded-2xl border border-[#e5eaf2] bg-white px-5 py-5 shadow-sm sm:flex-row sm:items-center sm:px-7 dark:border-[#2e3a50] dark:bg-[#1c2536]">
                        <div className="flex items-center gap-3">
                            <Checkbox id="select-all" checked={allSelected} onCheckedChange={(checked) => toggleAll(checked === true)} />
                            <div>
                                <label htmlFor="select-all" className="cursor-pointer font-semibold text-[#2a3547] dark:text-white">
                                    Seleccionar todos los permisos
                                </label>
                            </div>
                        </div>
                        <CheckCheck className="hidden size-6 text-[#13deb9] sm:block" />
                    </section>

                    <div className="grid gap-5 xl:grid-cols-2">
                        {permissionGroups.map((group) => {
                            const groupNames = group.permissions.map((permission) => permission.name);
                            const groupSelected = groupNames.length > 0 && groupNames.every((permission) => data.permissions.includes(permission));

                            return (
                                <section
                                    key={group.key}
                                    className="overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]"
                                >
                                    <div className="flex items-start justify-between gap-4 border-b border-[#e5eaf2] bg-[#f7f9fc] px-6 py-5 dark:border-[#2e3a50] dark:bg-[#253047]">
                                        <div className="flex gap-3">
                                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#49beff]/15 text-[#49beff]">
                                                <KeyRound className="size-5" />
                                            </div>
                                            <div>
                                                <h2 className="font-semibold text-[#2a3547] dark:text-white">{group.label}</h2>
                                                <p className="mt-1 text-sm leading-5 text-[#7c8fac]">{group.description}</p>
                                            </div>
                                        </div>
                                        <Checkbox
                                            checked={groupSelected}
                                            onCheckedChange={(checked) => toggleGroup(group, checked === true)}
                                            aria-label={`Seleccionar todos los permisos de ${group.label}`}
                                        />
                                    </div>

                                    <div className="grid gap-1 p-4 sm:grid-cols-2">
                                        {group.permissions.map((permission) => {
                                            const checked = data.permissions.includes(permission.name);

                                            return (
                                                <label
                                                    key={permission.id}
                                                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                                                        checked
                                                            ? 'border-[#5d87ff]/35 bg-[#5d87ff]/8'
                                                            : 'border-transparent hover:border-[#dfe5ef] hover:bg-[#f8faff] dark:hover:border-[#344159] dark:hover:bg-[#253047]'
                                                    }`}
                                                >
                                                    <Checkbox
                                                        checked={checked}
                                                        onCheckedChange={(value) => togglePermission(permission.name, value === true)}
                                                        className="mt-0.5"
                                                    />
                                                    <span className="flex flex-col gap-1">
                                                        <span className="text-sm font-semibold text-[#2a3547] dark:text-white">
                                                            {permission.label}
                                                        </span>
                                                        <span className="font-mono text-xs text-[#7c8fac]">{permission.name}</span>
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}
                    </div>

                    {errors.permissions && <p className="text-destructive text-sm font-medium">{errors.permissions}</p>}

                    <div className="sticky bottom-4 flex justify-end rounded-2xl border border-[#e5eaf2] bg-white/95 p-4 shadow-lg backdrop-blur dark:border-[#2e3a50] dark:bg-[#1c2536]/95">
                        <Button type="submit" disabled={processing || !isDirty} className="h-11 bg-[#5d87ff] px-6 text-white hover:bg-[#4d76e8]">
                            <Save className="size-4" />
                            {processing ? 'Guardando...' : 'Guardar permisos'}
                        </Button>
                    </div>
                </form>
            </main>
        </AppLayout>
    );
}
