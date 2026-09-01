import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

interface LoginForm extends Record<string, string | boolean> {
    email: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        email: '',
        password: '',
        remember: false,
    });
    const deviceError = (errors as Record<string, string | undefined>).device;

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthSplitLayout view="login" title="Bienvenido de nuevo" description="Ingresa tus credenciales para acceder a Sistema Jurídico.">
            <Head title="Iniciar sesión" />

            {status && (
                <div className="mb-5 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {status}
                </div>
            )}

            {deviceError && (
                <div
                    role="alert"
                    className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300"
                >
                    {deviceError}
                </div>
            )}

            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="font-semibold text-[#2a3547] dark:text-white">
                            Correo electrónico
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nombre@ejemplo.com"
                            className="h-11 border-[#dfe5ef] bg-white focus-visible:border-[#5d87ff] focus-visible:ring-[#5d87ff]/20 dark:border-[#465670] dark:bg-[#1c2536]"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password" className="font-semibold text-[#2a3547] dark:text-white">
                                Contraseña
                            </Label>
                            {canResetPassword && (
                                <a
                                    href={route('password.request')}
                                    className="ml-auto rounded-md px-2 py-1 text-sm font-semibold text-[#5d87ff] transition-colors hover:bg-[#5d87ff]/10 hover:text-[#4f75e6] focus-visible:ring-2 focus-visible:ring-[#5d87ff]/30 focus-visible:outline-none"
                                    tabIndex={5}
                                >
                                    ¿Olvidaste tu contraseña?
                                </a>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Ingresa tu contraseña"
                            className="h-11 border-[#dfe5ef] bg-white focus-visible:border-[#5d87ff] focus-visible:ring-[#5d87ff]/20 dark:border-[#465670] dark:bg-[#1c2536]"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                            className="border-[#c5cfdd] data-[state=checked]:border-[#5d87ff] data-[state=checked]:bg-[#5d87ff]"
                        />
                        <Label htmlFor="remember" className="cursor-pointer font-normal text-[#2a3547] dark:text-[#d5deeb]">
                            Mantener sesión iniciada
                        </Label>
                    </div>

                    <Button type="submit" className="mt-2 h-11 w-full bg-[#5d87ff] text-white hover:bg-[#4f75e6]" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Iniciar sesión
                    </Button>
                </div>

                <div className="text-center text-sm text-[#7c8fac]">
                    ¿Aún no tienes una cuenta?{' '}
                    <a
                        href={route('register')}
                        className="font-semibold text-[#5d87ff] transition-colors hover:text-[#4f75e6] hover:underline"
                        tabIndex={5}
                    >
                        Crear una cuenta
                    </a>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
