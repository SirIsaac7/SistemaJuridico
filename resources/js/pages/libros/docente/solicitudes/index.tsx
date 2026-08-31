import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { EmptyLibrary } from '@/features/libros/components/empty-library';
import { LibrosPageHeader } from '@/features/libros/components/libros-page-header';
import { RespuestaSolicitudDialog } from '@/features/libros/components/respuesta-solicitud-dialog';
import { SolicitudStatus } from '@/features/libros/components/solicitud-status';
import { SolicitudTabs } from '@/features/libros/components/solicitud-tabs';
import { type EstadoSolicitud, type SolicitudRecibida } from '@/features/libros/types';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { BookOpen, Building2, CalendarDays, CheckCircle2, ClipboardList, Mail, XCircle } from 'lucide-react';
import { useState } from 'react';

interface SolicitudesRecibidasProps {
    solicitudes: SolicitudRecibida[];
    filters: { estado: EstadoSolicitud | null };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Libros', href: '/libros' },
    { title: 'Solicitudes recibidas', href: '/libros/solicitudes-recibidas' },
];

export default function SolicitudesRecibidas({ solicitudes, filters }: SolicitudesRecibidasProps) {
    const [selected, setSelected] = useState<{ solicitud: SolicitudRecibida; action: 'aceptada' | 'rechazada' } | null>(null);
    const getInitials = useInitials();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Solicitudes recibidas" />

            <main className="flex flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <LibrosPageHeader
                    eyebrow="Libros · Docente"
                    title="Solicitudes recibidas"
                    description="Acepta o rechaza únicamente las solicitudes correspondientes a tus materias."
                    icon={<ClipboardList className="size-4" />}
                />

                <SolicitudTabs current={filters.estado} baseUrl="/libros/solicitudes-recibidas" />

                {solicitudes.length === 0 ? (
                    <EmptyLibrary
                        title="No hay solicitudes en esta sección"
                        description="Las nuevas solicitudes de tus estudiantes aparecerán aquí."
                    />
                ) : (
                    <section className="flex flex-col gap-4">
                        {solicitudes.map((solicitud) => (
                            <article
                                key={solicitud.id}
                                className="rounded-2xl border border-[#e5eaf2] bg-white p-5 shadow-sm sm:p-6 dark:border-[#2e3a50] dark:bg-[#1c2536]"
                            >
                                <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
                                    <div className="flex min-w-0 items-start gap-4">
                                        <Avatar className="size-12 shrink-0">
                                            <AvatarFallback className="bg-[#5d87ff]/12 font-bold text-[#5d87ff]">
                                                {getInitials(solicitud.estudiante.nombre_completo)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h2 className="truncate text-lg font-bold text-[#2a3547] dark:text-white">
                                                    {solicitud.estudiante.nombre_completo}
                                                </h2>
                                                <SolicitudStatus estado={solicitud.estado} />
                                            </div>
                                            <div className="mt-1 flex items-center gap-2 text-sm text-[#7c8fac]">
                                                <Mail className="size-4" />
                                                <span className="truncate">{solicitud.estudiante.email}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {solicitud.estado === 'pendiente' && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelected({ solicitud, action: 'rechazada' })}
                                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-500/30"
                                            >
                                                <XCircle className="size-4" /> Rechazar
                                            </Button>
                                            <Button
                                                onClick={() => setSelected({ solicitud, action: 'aceptada' })}
                                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                            >
                                                <CheckCircle2 className="size-4" /> Aceptar
                                            </Button>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-5 grid gap-3 rounded-xl bg-[#f7f9fc] p-4 text-sm md:grid-cols-3 dark:bg-[#253047]">
                                    <div className="flex items-start gap-2 text-[#5a6a85] dark:text-[#aab7ca]">
                                        <BookOpen className="mt-0.5 size-4 shrink-0 text-[#5d87ff]" />
                                        <span>{solicitud.materia.nombre}</span>
                                    </div>
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

                                {solicitud.estado === 'rechazada' && solicitud.motivo_respuesta && (
                                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
                                        <span className="font-bold">Motivo:</span> {solicitud.motivo_respuesta}
                                    </div>
                                )}
                            </article>
                        ))}
                    </section>
                )}
            </main>

            {selected && (
                <RespuestaSolicitudDialog
                    key={`${selected.solicitud.id}-${selected.action}`}
                    open={Boolean(selected)}
                    onOpenChange={(open) => {
                        if (!open) setSelected(null);
                    }}
                    solicitud={selected.solicitud}
                    action={selected.action}
                />
            )}
        </AppLayout>
    );
}
