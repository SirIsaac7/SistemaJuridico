import { Button } from '@/components/ui/button';
import { EmptyLibrary } from '@/features/libros/components/empty-library';
import { LibrosPageHeader } from '@/features/libros/components/libros-page-header';
import { SolicitudStatus } from '@/features/libros/components/solicitud-status';
import { SolicitudTabs } from '@/features/libros/components/solicitud-tabs';
import { type EstadoSolicitud, type SolicitudPropia } from '@/features/libros/types';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, Building2, CalendarDays, ClipboardList, Plus, UserRound } from 'lucide-react';

interface SolicitudesProps {
    solicitudes: SolicitudPropia[];
    filters: { estado: EstadoSolicitud | null };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Libros', href: '/libros' },
    { title: 'Mis solicitudes', href: '/libros/solicitudes' },
];

export default function Solicitudes({ solicitudes, filters }: SolicitudesProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis solicitudes" />

            <main className="flex flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <LibrosPageHeader
                    eyebrow="Libros · Estudiante"
                    title="Mis solicitudes"
                    description="Consulta el estado de cada materia solicitada y el motivo cuando una solicitud sea rechazada."
                    icon={<ClipboardList className="size-4" />}
                    actions={
                        <Button asChild className="h-11 bg-[#5d87ff] px-5 text-white hover:bg-[#4d76e8]">
                            <Link href="/libros/catalogo" prefetch>
                                <Plus className="size-4" /> Agregar materia
                            </Link>
                        </Button>
                    }
                />

                <SolicitudTabs current={filters.estado} baseUrl="/libros/solicitudes" />

                {solicitudes.length === 0 ? (
                    <EmptyLibrary
                        title="No hay solicitudes en esta sección"
                        description="Cuando solicites una materia podrás consultar aquí si fue aceptada, sigue pendiente o fue rechazada."
                        actionHref="/libros/catalogo"
                        actionLabel="Agregar materia"
                    />
                ) : (
                    <section className="grid gap-5 lg:grid-cols-2">
                        {solicitudes.map((solicitud) => (
                            <article
                                key={solicitud.id}
                                className="rounded-2xl border border-[#e5eaf2] bg-white p-5 shadow-sm sm:p-6 dark:border-[#2e3a50] dark:bg-[#1c2536]"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex min-w-0 items-start gap-4">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#5d87ff]/12 text-[#5d87ff]">
                                            <BookOpen className="size-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h2 className="truncate text-lg font-bold text-[#2a3547] dark:text-white">{solicitud.materia.nombre}</h2>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-[#7c8fac]">
                                                <UserRound className="size-4" />
                                                <span className="truncate">{solicitud.materia.docente}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <SolicitudStatus estado={solicitud.estado} />
                                </div>

                                <div className="mt-5 grid gap-3 rounded-xl bg-[#f7f9fc] p-4 text-sm sm:grid-cols-2 dark:bg-[#253047]">
                                    <div className="flex items-start gap-2 text-[#5a6a85] dark:text-[#aab7ca]">
                                        <Building2 className="mt-0.5 size-4 shrink-0 text-[#49beff]" />
                                        <span>{solicitud.universidad}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-[#5a6a85] dark:text-[#aab7ca]">
                                        <CalendarDays className="mt-0.5 size-4 shrink-0 text-[#13deb9]" />
                                        <span>{solicitud.fecha_solicitud ?? '—'}</span>
                                    </div>
                                </div>

                                {solicitud.observacion && (
                                    <p className="mt-4 text-sm leading-6 text-[#5a6a85] dark:text-[#aab7ca]">{solicitud.observacion}</p>
                                )}

                                {solicitud.estado === 'rechazada' && (
                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-500/25 dark:bg-red-500/10">
                                        <p className="text-xs font-bold tracking-wide text-red-600 uppercase dark:text-red-300">Motivo</p>
                                        <p className="mt-1 text-sm leading-6 text-red-700 dark:text-red-200">
                                            {solicitud.motivo_respuesta || 'El docente no especificó un motivo.'}
                                        </p>
                                    </div>
                                )}

                                {solicitud.estado === 'aceptada' && (
                                    <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800 sm:flex-row sm:items-center sm:justify-between dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
                                        <span>El docente aprobó tu solicitud y la materia ya está habilitada.</span>
                                        <Link href="/libros" className="shrink-0 font-bold text-emerald-700 hover:underline dark:text-emerald-200">
                                            Ver materia
                                        </Link>
                                    </div>
                                )}
                            </article>
                        ))}
                    </section>
                )}
            </main>
        </AppLayout>
    );
}
