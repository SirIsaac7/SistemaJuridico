import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check, MonitorSmartphone, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import AuthSplitLayout from '@/layouts/auth/auth-split-layout';

export default function EmailVerified({ canContinue }: { canContinue: boolean }) {
    return (
        <AuthSplitLayout view="register" title="Correo verificado" description="Tu dirección de correo fue confirmada correctamente.">
            <Head title="Correo verificado" />

            <div className="flex flex-col gap-6">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900/70 dark:bg-emerald-950/30">
                    <div className="flex items-start gap-4">
                        <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                            <Check className="size-6" strokeWidth={2.5} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="font-bold text-emerald-950 dark:text-emerald-100">Tu cuenta ya está activa</h2>
                            <p className="text-sm leading-6 text-emerald-800 dark:text-emerald-200/80">
                                Confirmamos que tienes acceso al correo registrado. Ya puedes utilizar las funciones protegidas del sistema.
                            </p>
                        </div>
                    </div>
                </div>

                {!canContinue && (
                    <div className="flex items-start gap-3 rounded-xl border border-[#dfe5ef] bg-[#f8faff] p-4 dark:border-[#465670] dark:bg-[#26334a]">
                        <MonitorSmartphone className="mt-0.5 size-5 shrink-0 text-[#5d87ff]" />
                        <p className="text-sm leading-6 text-[#526178] dark:text-[#b8c4d8]">
                            Vuelve al navegador donde te registraste. Esta verificación no vinculó ni reemplazó tu dispositivo autorizado.
                        </p>
                    </div>
                )}

                {canContinue ? (
                    <Button asChild className="h-11 w-full bg-[#5d87ff] text-white hover:bg-[#4f75e6]">
                        <Link href={route('dashboard')}>
                            Continuar al sistema
                            <ArrowRight className="size-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button asChild variant="outline" className="h-11 w-full border-[#dfe5ef] dark:border-[#465670]">
                        <Link href={route('home')}>
                            <ShieldCheck className="size-4 text-[#5d87ff]" />
                            Ir al inicio
                        </Link>
                    </Button>
                )}
            </div>
        </AuthSplitLayout>
    );
}
