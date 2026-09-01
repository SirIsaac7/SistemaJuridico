import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { MonitorSmartphone } from 'lucide-react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
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
    mustVerifyEmail: boolean;
    status?: string;
    device: AuthorizedDevice | null;
}

export default function Profile({ mustVerifyEmail, status, device }: ProfileProps) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="mt-2 text-sm text-neutral-800">
                                    Your email address is unverified.
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="rounded-md text-sm text-neutral-600 underline hover:text-neutral-900 focus:ring-2 focus:ring-offset-2 focus:outline-hidden"
                                    >
                                        Click here to re-send the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
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

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}
