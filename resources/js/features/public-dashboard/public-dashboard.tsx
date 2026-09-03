import { motion, useReducedMotion } from 'framer-motion';
import { BookOpenCheck, Building2, Check, FileCheck2, Monitor, RefreshCcw, Scale, Users } from 'lucide-react';

import { ProfileWelcome } from '@/features/admin-dashboard/components/profile-welcome';

interface PublicDashboardProps {
    userName: string;
}

const highlights = [
    {
        title: 'Normativa emitida',
        description: 'Consulta disposiciones y documentos normativos organizados en un solo lugar.',
        icon: FileCheck2,
    },
    {
        title: 'Normativa actualizada',
        description: 'Accede a información jurídica actualizada de acuerdo con el plan contratado.',
        icon: RefreshCcw,
    },
    {
        title: 'Biblioteca especializada',
        description: 'Encuentra material académico y contenido compartido por docentes autorizados.',
        icon: BookOpenCheck,
    },
] as const;

const plans = [
    {
        name: 'Plan Estudiantil',
        price: 'Bs 99',
        period: 'por semestre',
        description: 'Pensado para estudiantes que necesitan consultar la normativa emitida durante su formación.',
        deviceLabel: '1 dispositivo',
        icon: BookOpenCheck,
        features: ['Acceso a la Normativa Emitida', 'Uso desde un navegador o dispositivo autorizado'],
    },
    {
        name: 'Plan Profesional',
        price: 'Bs 250',
        period: 'por semestre',
        alternative: 'o Bs 50 por mes',
        description: 'Para profesionales que requieren normativa emitida y contenido permanentemente actualizado.',
        deviceLabel: '1 dispositivo',
        icon: Scale,
        features: ['Acceso a la Normativa Emitida', 'Acceso a la Normativa Actualizada'],
    },
    {
        name: 'Plan Consultoría',
        price: 'Bs 1.000',
        period: 'por semestre',
        alternative: 'o Bs 200 por mes',
        description: 'Una alternativa amplia para equipos de consultoría que trabajan con información jurídica vigente.',
        deviceLabel: '5 dispositivos',
        icon: Users,
        features: ['Acceso a la Normativa Emitida', 'Acceso a la Normativa Actualizada'],
    },
    {
        name: 'Plan Empresarial o Institucional',
        price: 'A la medida',
        period: 'según el número de usuarios',
        description: 'Una propuesta flexible diseñada según el tamaño y las necesidades de cada organización.',
        deviceLabel: 'Usuarios personalizados',
        icon: Building2,
        features: ['Cantidad de usuarios personalizada', 'Configuración adaptada a la institución'],
    },
] as const;

export function PublicDashboard({ userName }: PublicDashboardProps) {
    const shouldReduceMotion = useReducedMotion();

    return (
        <main className="space-y-10 p-4 md:p-6">
            <ProfileWelcome userName={userName} description="Descubre las herramientas, contenidos y planes disponibles en Normativa Virtual" />

            <section aria-labelledby="servicios-title" className="space-y-5">
                <div>
                    <p className="text-sm font-semibold tracking-[0.16em] text-[#5d87ff] uppercase">Lo que encontrarás</p>
                    <h2 id="servicios-title" className="mt-2 text-2xl font-bold text-[#2a3547] dark:text-white">
                        Información jurídica para cada etapa
                    </h2>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                    {highlights.map((highlight) => {
                        const Icon = highlight.icon;

                        return (
                            <article
                                key={highlight.title}
                                className="rounded-2xl border border-[#e5eaf2] bg-white p-6 shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]"
                            >
                                <div className="flex size-11 items-center justify-center rounded-xl bg-[#5d87ff]/10 text-[#5d87ff]">
                                    <Icon className="size-5" aria-hidden="true" />
                                </div>
                                <h3 className="mt-5 text-lg font-bold text-[#2a3547] dark:text-white">{highlight.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-[#7c8fac]">{highlight.description}</p>
                            </article>
                        );
                    })}
                </div>
            </section>

            <section aria-labelledby="planes-title" className="space-y-5 pb-4">
                <div>
                    <p className="text-sm font-semibold tracking-[0.16em] text-[#5d87ff] uppercase">Suscripciones</p>
                    <h2 id="planes-title" className="mt-2 text-2xl font-bold text-[#2a3547] dark:text-white">
                        Planes disponibles
                    </h2>
                </div>

                <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;

                        return (
                            <motion.article
                                key={plan.name}
                                initial={shouldReduceMotion ? false : { opacity: 0, y: 32, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ type: 'spring', stiffness: 150, damping: 18, delay: shouldReduceMotion ? 0 : index * 0.09 }}
                                whileHover={shouldReduceMotion ? undefined : { y: -10, scale: 1.018 }}
                                className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(145deg,#f9fcff_0%,#eaf3ff_100%)] px-6 py-8 shadow-[0_18px_48px_rgba(72,111,170,0.14)] transition-shadow hover:shadow-[0_24px_60px_rgba(72,111,170,0.23)] dark:border-[#34435b] dark:bg-[linear-gradient(145deg,#253248_0%,#1c2536_100%)]"
                            >
                                <div className="text-center">
                                    <h3 className="min-h-12 text-xs leading-5 font-bold tracking-[0.28em] text-[#637493] uppercase dark:text-[#c8d4e7]">
                                        {plan.name}
                                    </h3>
                                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-xs font-bold text-[#526178] shadow-sm dark:bg-[#182235]/80 dark:text-[#c8d4e7]">
                                        <Monitor className="size-3.5 text-[#665af0]" aria-hidden="true" />
                                        {plan.deviceLabel}
                                    </div>
                                </div>

                                <p className="mt-6 min-h-20 text-center text-sm leading-6 text-[#526178] dark:text-[#b7c3d7]">{plan.description}</p>

                                <div className="mt-3 min-h-32 text-center">
                                    <p className="text-[2.65rem] leading-none font-extrabold tracking-[-0.045em] text-[#101b32] dark:text-white">
                                        {plan.price}
                                    </p>
                                    <p className="mt-3 text-sm font-medium text-[#8190a9]">{plan.period}</p>
                                    {'alternative' in plan && (
                                        <p className="mt-2 inline-flex rounded-full bg-[#665af0]/8 px-3 py-1 text-sm font-bold text-[#665af0] dark:bg-[#766cff]/15 dark:text-[#a9a3ff]">
                                            {plan.alternative}
                                        </p>
                                    )}
                                </div>

                                <div className="my-6 h-px bg-gradient-to-r from-transparent via-[#cfdaea] to-transparent dark:via-[#43516a]" />

                                <ul className="flex-1 space-y-4">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-[#526178] dark:text-[#c4cede]">
                                            <span className="mt-1 flex size-5 shrink-0 items-center justify-center text-[#665af0] dark:text-[#9189ff]">
                                                <Check className="size-4" strokeWidth={2.6} aria-hidden="true" />
                                            </span>
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <motion.div
                                    whileHover={shouldReduceMotion ? undefined : { scale: 1.03 }}
                                    className="mt-8 flex items-center justify-center gap-3 rounded-full bg-white/90 px-4 py-3.5 text-sm font-bold text-[#24324a] shadow-[0_10px_24px_rgba(72,111,170,0.18)] dark:bg-[#111a2b]/80 dark:text-white"
                                >
                                    <span className="flex size-8 items-center justify-center rounded-full bg-[#665af0] text-white">
                                        <Icon className="size-4" aria-hidden="true" />
                                    </span>
                                    Plan disponible
                                </motion.div>
                            </motion.article>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
