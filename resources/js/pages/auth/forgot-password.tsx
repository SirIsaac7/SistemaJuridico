import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, LoaderCircle, Mail } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <AuthSplitLayout
            view="login"
            title="Recupera tu contraseña"
            description="Te enviaremos un enlace seguro para establecer una nueva contraseña."
        >
            <Head title="Recuperar contraseña" />

            {status && (
                <div className="mb-5 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    {status}
                </div>
            )}

            <div className="space-y-7">
                <div className="flex size-12 items-center justify-center rounded-xl bg-[#5d87ff]/10 text-[#5d87ff]">
                    <Mail className="size-6" strokeWidth={1.8} />
                </div>

                <form className="space-y-6" onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="font-semibold text-[#2a3547] dark:text-white">
                            Correo electrónico
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            name="email"
                            required
                            autoComplete="email"
                            value={data.email}
                            autoFocus
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="nombre@ejemplo.com"
                            className="h-11 border-[#dfe5ef] bg-white focus-visible:border-[#5d87ff] focus-visible:ring-[#5d87ff]/20 dark:border-[#465670] dark:bg-[#1c2536]"
                        />

                        <InputError message={errors.email} />
                    </div>

                    <Button type="submit" className="h-11 w-full bg-[#5d87ff] text-white hover:bg-[#4f75e6]" disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Enviar enlace de recuperación
                    </Button>
                </form>

                <a
                    href={route('login')}
                    className="mx-auto flex w-fit items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold text-[#5d87ff] transition-colors hover:bg-[#5d87ff]/10 hover:text-[#4f75e6] focus-visible:ring-2 focus-visible:ring-[#5d87ff]/30 focus-visible:outline-none"
                >
                    <ArrowLeft className="size-4" />
                    Volver a iniciar sesión
                </a>
            </div>
        </AuthSplitLayout>
    );
}
