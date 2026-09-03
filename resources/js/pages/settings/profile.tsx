import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Mail, MonitorSmartphone } from 'lucide-react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Configuración del perfil',
        href: '/settings/profile',
    },
];

interface AuthorizedDevice {
    tipo_dispositivo: string;
    sistema_operativo: string;
    navegador: string;
    estado: string;
    fecha_vinculacion: string | null;
    ultimo_acceso: string | null;
}

interface ProfileProps {
    device: AuthorizedDevice | null;
}

export default function Profile({ device }: ProfileProps) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Configuración del perfil" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Información del perfil" description="Actualiza tu nombre y consulta el correo de tu cuenta" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nombre</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Nombre completo"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label>Correo electrónico</Label>
                            <div className="flex min-h-11 items-center gap-3 rounded-md border border-[#d9e0ea] bg-[#f5f7fa] px-3 py-2.5 text-sm text-[#526178] dark:border-[#2e3a50] dark:bg-[#202b3d] dark:text-[#b7c3d7]">
                                <Mail className="size-4 shrink-0 text-[#5d87ff]" aria-hidden="true" />
                                <span className="truncate">{auth.user.email}</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Guardar</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600 dark:text-neutral-300">Guardado</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <div className="space-y-6">
                    <HeadingSmall title="Dispositivo autorizado" description="Navegador vinculado actualmente a tu cuenta" />

                    <div className="rounded-xl border border-[#e5eaf2] bg-white p-5 dark:border-[#2e3a50] dark:bg-[#1c2536]">
                        {device ? (
                            <div className="flex items-start gap-4">
                                <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-[#5d87ff]/10 text-[#5d87ff]">
                                    <MonitorSmartphone className="size-5" />
                                </div>
                                <dl className="grid flex-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                                    {[
                                        ['Tipo de dispositivo', device.tipo_dispositivo],
                                        ['Sistema operativo', device.sistema_operativo],
                                        ['Navegador', device.navegador],
                                        ['Estado', device.estado === 'activo' ? 'Activo' : 'Inactivo'],
                                        ['Fecha de vinculación', device.fecha_vinculacion ?? '—'],
                                        ['Último acceso', device.ultimo_acceso ?? '—'],
                                    ].map(([label, value]) => (
                                        <div key={label}>
                                            <dt className="text-xs font-semibold tracking-wide text-[#7c8fac] uppercase">{label}</dt>
                                            <dd className="mt-1 text-sm font-medium text-[#2a3547] dark:text-white">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </div>
                        ) : (
                            <p className="text-sm text-[#7c8fac]">Todavía no existe un dispositivo autorizado.</p>
                        )}
                    </div>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
