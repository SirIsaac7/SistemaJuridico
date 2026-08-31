import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyLibrary } from '@/features/libros/components/empty-library';
import { LibrosPageHeader } from '@/features/libros/components/libros-page-header';
import { type ArchivoConcedido, type MateriaConcedidaDetalle } from '@/features/libros/types';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, Eye, File, FileImage, FileText, Film, FolderOpen, ShieldCheck, UserRound } from 'lucide-react';

interface MateriaConcedidaShowProps {
    materia: MateriaConcedidaDetalle;
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;

    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function FileTypeIcon({ tipo }: { tipo: ArchivoConcedido['tipo'] }) {
    const Icon = tipo === 'video' ? Film : tipo === 'imagen' || tipo === 'flujograma' ? FileImage : tipo === 'pdf' ? FileText : File;

    return <Icon className="size-6" />;
}

export default function MateriaConcedidaShow({ materia }: MateriaConcedidaShowProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Libros', href: '/libros' },
        { title: 'Mis materias', href: '/libros' },
        { title: materia.nombre, href: `/libros/mis-materias/${materia.id}` },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={materia.nombre} />

            <main className="flex flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <Link href="/libros" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#5d87ff] hover:underline">
                    <ArrowLeft className="size-4" /> Volver a mis materias
                </Link>

                <LibrosPageHeader
                    eyebrow="Materia habilitada"
                    title={materia.nombre}
                    description={materia.descripcion || 'Consulta los archivos habilitados por el docente.'}
                    icon={<FolderOpen className="size-4" />}
                />

                <section className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#e5eaf2] bg-white p-5 shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#7c8fac] uppercase">
                            <UserRound className="size-4" /> Docente
                        </p>
                        <p className="mt-2 font-bold text-[#2a3547] dark:text-white">{materia.docente}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e5eaf2] bg-white p-5 shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#7c8fac] uppercase">
                            <CalendarDays className="size-4" /> Acceso desde
                        </p>
                        <p className="mt-2 font-bold text-[#2a3547] dark:text-white">{materia.fecha_inicio ?? '—'}</p>
                    </div>
                    <div className="rounded-2xl border border-[#e5eaf2] bg-white p-5 shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#7c8fac] uppercase">
                            <ShieldCheck className="size-4" /> Vigencia
                        </p>
                        <p className="mt-2 font-bold text-emerald-600 dark:text-emerald-300">
                            {materia.fecha_fin ? `Hasta ${materia.fecha_fin}` : 'Sin fecha de vencimiento'}
                        </p>
                    </div>
                </section>

                {materia.archivos.length === 0 ? (
                    <EmptyLibrary title="No hay archivos disponibles" description="El docente todavía no habilitó archivos dentro de esta materia." />
                ) : (
                    <section className="overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                        <div className="border-b border-[#e5eaf2] px-5 py-5 sm:px-7 dark:border-[#2e3a50]">
                            <h2 className="text-lg font-bold text-[#2a3547] dark:text-white">Archivos disponibles</h2>
                            <p className="mt-1 text-sm text-[#7c8fac]">Solo se muestran los archivos activos de esta materia.</p>
                        </div>

                        <div className="divide-y divide-[#e5eaf2] dark:divide-[#2e3a50]">
                            {materia.archivos.map((archivo) => (
                                <article
                                    key={archivo.id}
                                    className="flex flex-col gap-4 px-5 py-5 transition-colors hover:bg-[#f8faff] sm:px-7 lg:flex-row lg:items-center dark:hover:bg-[#253047]/70"
                                >
                                    <div className="flex min-w-0 flex-1 items-start gap-4">
                                        <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#49beff]/12 text-[#1a9bd1] dark:text-[#49beff]">
                                            <FileTypeIcon tipo={archivo.tipo} />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <h3 className="font-bold text-[#2a3547] dark:text-white">{archivo.titulo}</h3>
                                                <Badge className="border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                    Disponible
                                                </Badge>
                                            </div>
                                            <p className="mt-1 truncate text-sm text-[#7c8fac]">{archivo.nombre_original}</p>
                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7c8fac]">
                                                <span className="uppercase">{archivo.tipo}</span>
                                                <span>{formatBytes(archivo.tamano_bytes)}</span>
                                                <span>{archivo.created_at ?? '—'}</span>
                                            </div>
                                            {archivo.descripcion && (
                                                <p className="mt-2 text-sm leading-5 text-[#5a6a85] dark:text-[#aab7ca]">{archivo.descripcion}</p>
                                            )}
                                        </div>
                                    </div>

                                    <Button asChild variant="outline" className="shrink-0">
                                        <a
                                            href={`/libros/mis-materias/${materia.id}/archivos/${archivo.id}/visor`}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <Eye className="size-4" /> Ver archivo
                                        </a>
                                    </Button>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </AppLayout>
    );
}
