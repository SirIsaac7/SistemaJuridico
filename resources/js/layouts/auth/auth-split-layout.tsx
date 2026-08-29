import { Link } from '@inertiajs/react';
import { motion, useReducedMotion } from 'framer-motion';
import { Scale } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    description: string;
    view: 'login' | 'register';
}

function LegalBrand({ compact = false }: { compact?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[#5d87ff] text-white shadow-lg shadow-[#5d87ff]/20">
                <Scale className="size-6" strokeWidth={1.8} />
            </div>
            <div className={compact ? 'leading-tight' : 'leading-none'}>
                <p className="text-lg font-bold tracking-tight text-[#2a3547] dark:text-white">Sistema Jurídico</p>
                <p className="mt-1 text-[10px] font-semibold tracking-[0.2em] text-[#7c8fac] uppercase">Gestión legal</p>
            </div>
        </div>
    );
}

export default function AuthSplitLayout({ children, title, description, view }: AuthLayoutProps) {
    const shouldReduceMotion = useReducedMotion();
    const isLogin = view === 'login';
    const transition = { duration: shouldReduceMotion ? 0 : 0.58, ease: [0.22, 1, 0.36, 1] as const };

    return (
        <div className="tailwind-admin-auth grid min-h-svh overflow-hidden bg-white text-[#2a3547] lg:grid-cols-2 dark:bg-[#1c2536] dark:text-white">
            <motion.section
                initial={{ x: shouldReduceMotion ? 0 : isLogin ? 90 : -90, opacity: shouldReduceMotion ? 1 : 0.65 }}
                animate={{ x: 0, opacity: 1 }}
                transition={transition}
                className={`relative hidden min-h-svh overflow-hidden bg-[#ecf2ff] lg:flex lg:flex-col dark:bg-[#26334a] ${isLogin ? 'lg:order-2' : 'lg:order-1'}`}
            >
                <div className="absolute -top-28 -left-28 size-80 rounded-full bg-[#5d87ff]/10" />
                <div className="absolute -right-24 -bottom-24 size-72 rounded-full bg-[#49beff]/10" />

                <Link href={route('home')} className="relative z-10 w-fit p-10 xl:p-12">
                    <LegalBrand />
                </Link>

                <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-12 pb-12 text-center">
                    <img
                        src="/assets/auth/login-security.svg"
                        alt="Seguridad y gestión jurídica digital"
                        className="w-full max-w-[560px] object-contain drop-shadow-sm"
                    />
                    <div className="mt-7 max-w-xl space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight text-[#2a3547] dark:text-white">Tu gestión jurídica, segura y organizada</h2>
                        <p className="text-sm leading-6 text-[#7c8fac] dark:text-[#a7b5cc]">
                            Administra expedientes, documentos y actividades legales desde un único espacio de trabajo.
                        </p>
                    </div>
                </div>
            </motion.section>

            <motion.main
                initial={{ x: shouldReduceMotion ? 0 : isLogin ? -90 : 90, opacity: shouldReduceMotion ? 1 : 0.65 }}
                animate={{ x: 0, opacity: 1 }}
                transition={transition}
                className={`flex min-h-svh items-center justify-center px-5 py-10 sm:px-10 lg:px-12 xl:px-20 ${isLogin ? 'lg:order-1' : 'lg:order-2'}`}
            >
                <div className="w-full max-w-[450px]">
                    <Link href={route('home')} className="mb-10 flex w-fit lg:hidden">
                        <LegalBrand compact />
                    </Link>

                    <div className="mb-8 space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-[#2a3547] sm:text-[28px] dark:text-white">{title}</h1>
                        <p className="text-sm leading-6 text-[#7c8fac] dark:text-[#a7b5cc]">{description}</p>
                    </div>

                    {children}
                </div>
            </motion.main>
        </div>
    );
}
