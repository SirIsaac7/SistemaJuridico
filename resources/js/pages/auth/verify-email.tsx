import { type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage, usePoll } from '@inertiajs/react';
import { CheckCircle2, LoaderCircle, LogOut, MailCheck, RefreshCw, ShieldCheck, Smartphone } from 'lucide-react';
import { FormEventHandler } from 'react';

import { Button } from '@/components/ui/button';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});
    const { auth } = usePage<SharedData>().props;

    usePoll(4000);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <AuthSplitLayout view="register" title="Revisa tu correo" description="Enviamos un enlace seguro para activar tu cuenta.">
            <Head title="Verifica tu correo" />

            {status === 'verification-link-sent' && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-200">
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                    <span>Enviamos un nuevo enlace de verificación. Revisa también tu carpeta de correo no deseado.</span>
                </div>
            )}

            <div className="flex flex-col gap-5">
                <div className="rounded-2xl border border-[#dfe5ef] bg-[#f8faff] p-5 dark:border-[#465670] dark:bg-[#26334a]">
                    <div className="flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#5d87ff] text-white shadow-lg shadow-[#5d87ff]/20">
                            <MailCheck className="size-6" />
                        </div>
                        <div className="min-w-0 space-y-1">
                            <p className="text-xs font-semibold tracking-[0.14em] text-[#7c8fac] uppercase">Enlace enviado a</p>
                            <p className="truncate font-semibold text-[#2a3547] dark:text-white">{auth.user.email}</p>
                        </div>
                    </div>

                    <ol className="mt-5 grid gap-3 text-sm text-[#526178] dark:text-[#b8c4d8]">
                        <li className="flex gap-3">
                            <span className="font-bold text-[#5d87ff]">1.</span>Abre el mensaje enviado por Normativa Virtual.
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-[#5d87ff]">2.</span>Presiona “Verificar mi correo”.
                        </li>
                        <li className="flex gap-3">
                            <span className="font-bold text-[#5d87ff]">3.</span>Regresa aquí; detectaremos la confirmación automáticamente.
                        </li>
                    </ol>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/20">
                    <Smartphone className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                    <p className="text-sm leading-6 text-amber-900 dark:text-amber-200">
                        Puedes abrir el correo desde tu celular. No se cambiará el dispositivo vinculado a tu cuenta.
                    </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs font-medium text-[#7c8fac]">
                    <ShieldCheck className="size-4 text-emerald-500" />
                    Comprobación automática activa
                </div>

                <form onSubmit={submit} className="grid gap-3">
                    <Button disabled={processing} variant="outline" className="h-11 border-[#dfe5ef] dark:border-[#465670]">
                        {processing ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                        Reenviar correo de verificación
                    </Button>

                    <Button type="button" onClick={() => router.reload()} className="h-11 bg-[#5d87ff] text-white hover:bg-[#4f75e6]">
                        Ya verifiqué mi correo
                    </Button>
                </form>

                <Link
                    href={route('logout')}
                    method="post"
                    as="button"
                    className="mx-auto flex items-center gap-2 text-sm font-semibold text-[#7c8fac] transition-colors hover:text-[#2a3547] dark:hover:text-white"
                >
                    <LogOut className="size-4" />
                    Cerrar sesión
                </Link>
            </div>
        </AuthSplitLayout>
    );
}
