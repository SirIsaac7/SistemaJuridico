import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { PasswordRequirements } from '@/components/password-requirements';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

interface RegisterForm extends Record<string, string> {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm<RegisterForm>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AuthSplitLayout view="register" title="Crea tu cuenta" description="Completa tus datos para comenzar a utilizar Normativa Virtual.">
            <Head title="Crear cuenta" />
            <form className="flex flex-col gap-5" onSubmit={submit}>
                <div className="grid gap-5">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="font-semibold text-[#2a3547] dark:text-white">
                            Nombre completo
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Tu nombre completo"
                            className="h-11 border-[#dfe5ef] bg-white focus-visible:border-[#5d87ff] focus-visible:ring-[#5d87ff]/20 dark:border-[#465670] dark:bg-[#1c2536]"
                        />
                        <InputError message={errors.name} className="mt-2" />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email" className="font-semibold text-[#2a3547] dark:text-white">
                            Correo electrónico
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={2}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                            placeholder="nombre@ejemplo.com"
                            className="h-11 border-[#dfe5ef] bg-white focus-visible:border-[#5d87ff] focus-visible:ring-[#5d87ff]/20 dark:border-[#465670] dark:bg-[#1c2536]"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password" className="font-semibold text-[#2a3547] dark:text-white">
                            Contraseña
                        </Label>
                        <PasswordInput
                            id="password"
                            required
                            tabIndex={3}
                            autoComplete="new-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            disabled={processing}
                            placeholder="Crea una contraseña"
                            className="h-11 border-[#dfe5ef] bg-white focus-visible:border-[#5d87ff] focus-visible:ring-[#5d87ff]/20 dark:border-[#465670] dark:bg-[#1c2536]"
                        />
                        <InputError message={errors.password} />
                        <PasswordRequirements password={data.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation" className="font-semibold text-[#2a3547] dark:text-white">
                            Confirmar contraseña
                        </Label>
                        <PasswordInput
                            id="password_confirmation"
                            required
                            tabIndex={4}
                            autoComplete="new-password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            disabled={processing}
                            placeholder="Repite tu contraseña"
                            className="h-11 border-[#dfe5ef] bg-white focus-visible:border-[#5d87ff] focus-visible:ring-[#5d87ff]/20 dark:border-[#465670] dark:bg-[#1c2536]"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <Button type="submit" className="mt-2 h-11 w-full bg-[#5d87ff] text-white hover:bg-[#4f75e6]" tabIndex={5} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Crear cuenta
                    </Button>
                </div>

                <div className="text-center text-sm text-[#7c8fac]">
                    ¿Ya tienes una cuenta?{' '}
                    <a
                        href={route('login')}
                        className="font-semibold text-[#5d87ff] transition-colors hover:text-[#4f75e6] hover:underline"
                        tabIndex={6}
                    >
                        Iniciar sesión
                    </a>
                </div>
            </form>
        </AuthSplitLayout>
    );
}
