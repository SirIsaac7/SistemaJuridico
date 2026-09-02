import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyLibrary } from '@/features/libros/components/empty-library';
import { LibrosModuleNav } from '@/features/libros/components/libros-module-nav';
import { LibrosPageHeader } from '@/features/libros/components/libros-page-header';
import { type DocenteOption, MateriaDocenteFormDialog } from '@/features/libros/components/materia-docente-form-dialog';
import { MateriaFormDialog } from '@/features/libros/components/materia-form-dialog';
import { MateriaUnificadaCard } from '@/features/libros/components/materia-unificada-card';
import { type MateriaUnificadaResumen } from '@/features/libros/types';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { LibraryBig, Plus, Search, UserRoundPlus } from 'lucide-react';
import { type FormEvent, useState } from 'react';

type Ambito = 'todas' | 'impartidas' | 'concedidas';
type Estado = 'activas' | 'inactivas' | 'todas';

interface LibrosIndexProps {
    materias: MateriaUnificadaResumen[];
    docentes: DocenteOption[];
    filters: {
        ambito: Ambito;
        buscar: string;
        estado: Estado;
    };
    can: {
        create_own_subject: boolean;
        create_for_teacher: boolean;
        manage_subjects: boolean;
        supervise: boolean;
        view_catalog: boolean;
        view_own_requests: boolean;
        view_received_requests: boolean;
        view_granted_subjects: boolean;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Libros', href: '/libros' },
];

export default function LibrosIndex({ materias, docentes, filters, can }: LibrosIndexProps) {
    const [buscar, setBuscar] = useState(filters.buscar);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [teacherDialogOpen, setTeacherDialogOpen] = useState(false);

    const ambitos = [
        { value: 'todas' as const, label: 'Todas' },
        ...(can.manage_subjects ? [{ value: 'impartidas' as const, label: 'Que imparto' }] : []),
        ...(can.view_granted_subjects ? [{ value: 'concedidas' as const, label: 'Con acceso' }] : []),
    ];
    const estados = [
        { value: 'todas' as const, label: 'Todos los estados' },
        { value: 'activas' as const, label: 'Activas' },
        ...(can.manage_subjects || can.supervise ? [{ value: 'inactivas' as const, label: 'Inhabilitadas' }] : []),
    ];

    function visit(next: Partial<LibrosIndexProps['filters']>) {
        router.get('/libros', { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        visit({ buscar });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Libros" />

            <main className="flex min-w-0 flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <LibrosPageHeader
                    eyebrow="Biblioteca jurídica"
                    title="Libros"
                    description="Un solo espacio para consultar, gestionar o supervisar materias según los permisos de tu cuenta."
                    icon={<LibraryBig className="size-4" />}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            {can.create_for_teacher ? (
                                <Button onClick={() => setTeacherDialogOpen(true)} className="h-11 bg-[#5d87ff] text-white hover:bg-[#4d76e8]">
                                    <UserRoundPlus className="size-4" /> Crear materia para docente
                                </Button>
                            ) : can.view_catalog ? (
                                <Button asChild variant="outline" className="h-11">
                                    <Link href="/libros/catalogo" prefetch>
                                        <Plus className="size-4" /> Agregar materia
                                    </Link>
                                </Button>
                            ) : null}
                            {!can.create_for_teacher && can.create_own_subject && (
                                <Button onClick={() => setCreateDialogOpen(true)} className="h-11 bg-[#5d87ff] text-white hover:bg-[#4d76e8]">
                                    <Plus className="size-4" /> Crear materia
                                </Button>
                            )}
                        </div>
                    }
                />

                <LibrosModuleNav />

                <section className="rounded-2xl border border-[#e5eaf2] bg-white p-4 shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                    <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7c8fac]" />
                            <Input
                                value={buscar}
                                onChange={(event) => setBuscar(event.target.value)}
                                placeholder="Buscar materia, docente o correo..."
                                className="h-11 pl-10"
                            />
                        </div>
                        <Button type="submit" className="h-11 bg-[#5d87ff] px-6 text-white hover:bg-[#4d76e8]">
                            Buscar
                        </Button>
                    </form>

                    <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {ambitos.map((ambito) => (
                                <button
                                    key={ambito.value}
                                    type="button"
                                    onClick={() => visit({ ambito: ambito.value })}
                                    className={`h-9 shrink-0 rounded-lg px-4 text-sm font-semibold transition-colors ${
                                        filters.ambito === ambito.value
                                            ? 'bg-[#5d87ff] text-white'
                                            : 'border border-[#dfe5ef] text-[#5a6a85] hover:border-[#5d87ff]/40 hover:text-[#5d87ff] dark:border-[#344159] dark:text-[#aab7ca]'
                                    }`}
                                >
                                    {ambito.label}
                                </button>
                            ))}
                        </div>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {estados.map((estado) => (
                                <button
                                    key={estado.value}
                                    type="button"
                                    onClick={() => visit({ estado: estado.value })}
                                    className={`h-9 shrink-0 rounded-lg px-4 text-sm font-semibold transition-colors ${
                                        filters.estado === estado.value
                                            ? 'bg-[#253047] text-white dark:bg-[#5d87ff]'
                                            : 'border border-[#dfe5ef] text-[#5a6a85] hover:border-[#5d87ff]/40 hover:text-[#5d87ff] dark:border-[#344159] dark:text-[#aab7ca]'
                                    }`}
                                >
                                    {estado.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </section>

                {materias.length === 0 ? (
                    <EmptyLibrary
                        title="No hay materias para mostrar"
                        description="No existen materias que coincidan con tus permisos y los filtros seleccionados."
                        actionHref={can.view_catalog ? '/libros/catalogo' : undefined}
                        actionLabel="Explorar catálogo"
                    />
                ) : (
                    <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {materias.map((materia) => (
                            <MateriaUnificadaCard key={materia.id} materia={materia} />
                        ))}
                    </section>
                )}
            </main>

            {createDialogOpen && <MateriaFormDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} materia={null} />}
            {teacherDialogOpen && <MateriaDocenteFormDialog open={teacherDialogOpen} onOpenChange={setTeacherDialogOpen} docentes={docentes} />}
        </AppLayout>
    );
}
