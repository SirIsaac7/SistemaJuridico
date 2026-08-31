import { Button } from '@/components/ui/button';
import { EmptyLibrary } from '@/features/libros/components/empty-library';
import { LibrosPageHeader } from '@/features/libros/components/libros-page-header';
import { type MateriaConcedidaResumen } from '@/features/libros/types';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { BookOpen, CalendarDays, ClipboardList, Files, FolderOpen, LibraryBig, Plus, UserRound } from 'lucide-react';

interface LibrosIndexProps {
    materias: MateriaConcedidaResumen[];
    can: {
        manage_subjects: boolean;
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

export default function LibrosIndex({ materias, can }: LibrosIndexProps) {
    const isTeacher = can.manage_subjects;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Libros" />

            <main className="flex flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <LibrosPageHeader
                    eyebrow="Biblioteca jurídica"
                    title={isTeacher ? 'Libros' : 'Mis materias'}
                    description={
                        isTeacher
                            ? 'Administra tus materias, archivos y solicitudes desde un solo lugar.'
                            : 'Aquí aparecerán las materias cuyo acceso haya sido habilitado para ti.'
                    }
                    icon={<LibraryBig className="size-4" />}
                    actions={
                        !isTeacher && can.view_catalog ? (
                            <Button asChild className="h-11 bg-[#5d87ff] px-5 text-white hover:bg-[#4d76e8]">
                                <Link href="/libros/catalogo" prefetch>
                                    <Plus className="size-4" /> Agregar materia
                                </Link>
                            </Button>
                        ) : undefined
                    }
                />

                {isTeacher ? (
                    <section className="grid gap-5 md:grid-cols-2">
                        <Link
                            href="/libros/materias"
                            prefetch
                            className="group rounded-2xl border border-[#e5eaf2] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#5d87ff]/35 hover:shadow-lg dark:border-[#2e3a50] dark:bg-[#1c2536]"
                        >
                            <div className="flex size-12 items-center justify-center rounded-xl bg-[#5d87ff]/12 text-[#5d87ff]">
                                <FolderOpen className="size-6" />
                            </div>
                            <h2 className="mt-5 text-xl font-bold text-[#2a3547] dark:text-white">Mis materias</h2>
                            <p className="mt-2 text-sm leading-6 text-[#7c8fac]">Crea materias y organiza todos sus archivos privados.</p>
                            <span className="mt-5 inline-flex text-sm font-semibold text-[#5d87ff] group-hover:underline">Administrar materias</span>
                        </Link>

                        {can.view_received_requests && (
                            <Link
                                href="/libros/solicitudes-recibidas"
                                prefetch
                                className="group rounded-2xl border border-[#e5eaf2] bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-[#13deb9]/40 hover:shadow-lg dark:border-[#2e3a50] dark:bg-[#1c2536]"
                            >
                                <div className="flex size-12 items-center justify-center rounded-xl bg-[#13deb9]/12 text-[#0a9b82] dark:text-[#13deb9]">
                                    <ClipboardList className="size-6" />
                                </div>
                                <h2 className="mt-5 text-xl font-bold text-[#2a3547] dark:text-white">Solicitudes recibidas</h2>
                                <p className="mt-2 text-sm leading-6 text-[#7c8fac]">Revisa y responde las solicitudes enviadas por estudiantes.</p>
                                <span className="mt-5 inline-flex text-sm font-semibold text-[#0a9b82] group-hover:underline dark:text-[#13deb9]">
                                    Revisar solicitudes
                                </span>
                            </Link>
                        )}
                    </section>
                ) : materias.length === 0 ? (
                    <EmptyLibrary
                        title="Aún no tienes materias habilitadas"
                        description="Agrega una materia para enviar una solicitud al docente. Podrás seguir su estado desde Mis solicitudes."
                        actionHref={can.view_catalog ? '/libros/catalogo' : undefined}
                    />
                ) : (
                    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {materias.map((materia) => (
                            <Link
                                key={materia.id}
                                href={`/libros/mis-materias/${materia.id}`}
                                prefetch
                                className="group overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#5d87ff]/35 hover:shadow-lg dark:border-[#2e3a50] dark:bg-[#1c2536]"
                            >
                                <div className="h-2 bg-gradient-to-r from-[#5d87ff] to-[#49beff]" />
                                <div className="flex flex-col gap-5 p-6">
                                    <div className="flex size-12 items-center justify-center rounded-xl bg-[#5d87ff]/12 text-[#5d87ff]">
                                        <BookOpen className="size-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-[#2a3547] group-hover:text-[#5d87ff] dark:text-white">
                                            {materia.nombre}
                                        </h2>
                                        <p className="mt-2 flex items-center gap-2 text-sm text-[#7c8fac]">
                                            <UserRound className="size-4" /> {materia.docente}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#f7f9fc] p-4 text-sm dark:bg-[#253047]">
                                        <div>
                                            <p className="flex items-center gap-1.5 text-xs text-[#7c8fac]">
                                                <Files className="size-3.5" /> Archivos
                                            </p>
                                            <p className="mt-1 font-bold text-[#2a3547] dark:text-white">{materia.archivos_count}</p>
                                        </div>
                                        <div>
                                            <p className="flex items-center gap-1.5 text-xs text-[#7c8fac]">
                                                <CalendarDays className="size-3.5" /> Desde
                                            </p>
                                            <p className="mt-1 truncate font-semibold text-[#2a3547] dark:text-white">
                                                {materia.fecha_inicio ?? '—'}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-sm font-semibold text-[#5d87ff] group-hover:underline">Ver archivos</span>
                                </div>
                            </Link>
                        ))}
                    </section>
                )}
            </main>
        </AppLayout>
    );
}
