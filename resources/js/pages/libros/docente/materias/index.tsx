import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyLibrary } from '@/features/libros/components/empty-library';
import { LibrosPageHeader } from '@/features/libros/components/libros-page-header';
import { MateriaFormDialog } from '@/features/libros/components/materia-form-dialog';
import { type MateriaResumen } from '@/features/libros/types';
import AppLayout from '@/layouts/app-layout';
import { confirmAction } from '@/lib/sweet-alert';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { BookOpen, FileText, FolderOpen, Pencil, Plus, Power, RotateCcw, Users } from 'lucide-react';
import { useState } from 'react';

interface MateriasIndexProps {
    materias: MateriaResumen[];
    filters: { estado: 'activas' | 'inactivas' | 'todas' };
    can: { create: boolean };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Libros', href: '/libros' },
    { title: 'Mis materias', href: '/libros/materias' },
];

const filters = [
    { value: 'activas', label: 'Activas' },
    { value: 'inactivas', label: 'Inhabilitadas' },
    { value: 'todas', label: 'Todas' },
] as const;

export default function MateriasIndex({ materias, filters: currentFilters, can }: MateriasIndexProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingMateria, setEditingMateria] = useState<MateriaResumen | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    function openCreate() {
        setEditingMateria(null);
        setDialogOpen(true);
    }

    function openEdit(materia: MateriaResumen) {
        setEditingMateria(materia);
        setDialogOpen(true);
    }

    async function changeStatus(materia: MateriaResumen) {
        const activate = !materia.is_active;
        const confirmed = await confirmAction({
            title: activate ? 'Reactivar materia' : 'Inhabilitar materia',
            text: activate
                ? `${materia.nombre} volverá a estar disponible.`
                : `${materia.nombre} y sus archivos dejarán de estar disponibles para los estudiantes.`,
            confirmText: activate ? 'Reactivar' : 'Inhabilitar',
            tone: activate ? 'success' : 'danger',
        });

        if (!confirmed) return;

        router.put(
            `/libros/materias/${materia.id}/estado`,
            { is_active: activate },
            {
                preserveScroll: true,
                onStart: () => setProcessingId(materia.id),
                onFinish: () => setProcessingId(null),
            },
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mis materias" />

            <main className="flex flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <LibrosPageHeader
                    eyebrow="Libros · Docente"
                    title="Mis materias"
                    description="Cada materia funciona como una carpeta privada para organizar tus archivos."
                    icon={<BookOpen className="size-4" />}
                    actions={
                        can.create ? (
                            <Button onClick={openCreate} className="h-11 bg-[#5d87ff] px-5 text-white hover:bg-[#4d76e8]">
                                <Plus className="size-4" />
                                Crear materia
                            </Button>
                        ) : null
                    }
                />

                <div className="flex gap-2 overflow-x-auto pb-1">
                    {filters.map((filter) => (
                        <Link
                            key={filter.value}
                            href={filter.value === 'activas' ? '/libros/materias' : `/libros/materias?estado=${filter.value}`}
                            preserveState
                            preserveScroll
                            className={`inline-flex h-10 shrink-0 items-center rounded-lg px-4 text-sm font-semibold transition-colors ${
                                currentFilters.estado === filter.value
                                    ? 'bg-[#5d87ff] text-white shadow-sm'
                                    : 'border border-[#dfe5ef] bg-white text-[#5a6a85] hover:border-[#5d87ff]/40 hover:text-[#5d87ff] dark:border-[#344159] dark:bg-[#1c2536] dark:text-[#aab7ca]'
                            }`}
                        >
                            {filter.label}
                        </Link>
                    ))}
                </div>

                {materias.length === 0 ? (
                    <EmptyLibrary
                        title={currentFilters.estado === 'inactivas' ? 'No tienes materias inhabilitadas' : 'Crea tu primera materia'}
                        description="Las materias te permiten agrupar PDF, videos, imágenes, flujogramas y otros archivos."
                    />
                ) : (
                    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {materias.map((materia) => (
                            <article
                                key={materia.id}
                                className="group flex flex-col overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-[#2e3a50] dark:bg-[#1c2536]"
                            >
                                <div className="flex items-start justify-between gap-4 border-b border-[#edf1f7] p-5 dark:border-[#2e3a50]">
                                    <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-[#5d87ff]/12 text-[#5d87ff]">
                                        <FolderOpen className="size-6" />
                                    </div>
                                    <Badge
                                        className={`border-0 ${
                                            materia.is_active
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                : 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300'
                                        }`}
                                    >
                                        {materia.is_active ? 'Activa' : 'Inhabilitada'}
                                    </Badge>
                                </div>

                                <div className="flex flex-1 flex-col gap-4 p-5">
                                    <div>
                                        <h2 className="text-lg font-bold text-[#2a3547] dark:text-white">{materia.nombre}</h2>
                                        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-[#7c8fac]">
                                            {materia.descripcion || 'Sin descripción.'}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="rounded-xl bg-[#f7f9fc] px-3 py-3 dark:bg-[#253047]">
                                            <div className="flex items-center gap-2 text-xs text-[#7c8fac]">
                                                <FileText className="size-3.5" /> Archivos
                                            </div>
                                            <p className="mt-1 font-bold text-[#2a3547] dark:text-white">{materia.archivos_activos_count}</p>
                                        </div>
                                        <div className="rounded-xl bg-[#f7f9fc] px-3 py-3 dark:bg-[#253047]">
                                            <div className="flex items-center gap-2 text-xs text-[#7c8fac]">
                                                <Users className="size-3.5" /> Solicitudes
                                            </div>
                                            <p className="mt-1 font-bold text-[#2a3547] dark:text-white">{materia.solicitudes_pendientes_count}</p>
                                        </div>
                                    </div>

                                    <div className="mt-auto flex flex-wrap gap-2 pt-1">
                                        <Button asChild size="sm" className="bg-[#5d87ff] text-white hover:bg-[#4d76e8]">
                                            <Link href={`/libros/materias/${materia.id}`} prefetch>
                                                <FolderOpen className="size-4" /> Abrir
                                            </Link>
                                        </Button>
                                        {materia.can.update && (
                                            <Button variant="outline" size="sm" onClick={() => openEdit(materia)}>
                                                <Pencil className="size-4" /> Editar
                                            </Button>
                                        )}
                                        {materia.can.update_status && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={processingId === materia.id}
                                                onClick={() => void changeStatus(materia)}
                                                className={
                                                    materia.is_active ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                                                }
                                            >
                                                {materia.is_active ? <Power className="size-4" /> : <RotateCcw className="size-4" />}
                                                {materia.is_active ? 'Inhabilitar' : 'Reactivar'}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            {dialogOpen && (
                <MateriaFormDialog key={editingMateria?.id ?? 'create'} open={dialogOpen} onOpenChange={setDialogOpen} materia={editingMateria} />
            )}
        </AppLayout>
    );
}
