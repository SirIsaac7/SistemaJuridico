import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyLibrary } from '@/features/libros/components/empty-library';
import { LibrosPageHeader } from '@/features/libros/components/libros-page-header';
import { SolicitudFormDialog } from '@/features/libros/components/solicitud-form-dialog';
import { type MateriaCatalogo } from '@/features/libros/types';
import { useInitials } from '@/hooks/use-initials';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, BookOpen, CheckCircle2, LibraryBig, Send } from 'lucide-react';
import { useState } from 'react';

interface CatalogoProps {
    materias: MateriaCatalogo[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Libros', href: '/libros' },
    { title: 'Agregar materia', href: '/libros/catalogo' },
];

export default function Catalogo({ materias }: CatalogoProps) {
    const [selectedMateria, setSelectedMateria] = useState<MateriaCatalogo | null>(null);
    const getInitials = useInitials();

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Agregar materia" />

            <main className="flex flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <Link href="/libros" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#5d87ff] hover:underline">
                    <ArrowLeft className="size-4" /> Volver a mis materias
                </Link>

                <LibrosPageHeader
                    eyebrow="Catálogo"
                    title="Agregar materia"
                    description="Selecciona una materia y envía una solicitud al docente responsable."
                    icon={<LibraryBig className="size-4" />}
                />

                {materias.length === 0 ? (
                    <EmptyLibrary title="No hay materias disponibles" description="Los docentes todavía no publicaron materias activas." />
                ) : (
                    <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                        {materias.map((materia) => (
                            <article
                                key={materia.id}
                                className="flex flex-col overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-[#2e3a50] dark:bg-[#1c2536]"
                            >
                                <div className="h-2 bg-gradient-to-r from-[#5d87ff] to-[#49beff]" />
                                <div className="flex flex-1 flex-col gap-5 p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex size-12 items-center justify-center rounded-xl bg-[#5d87ff]/12 text-[#5d87ff]">
                                            <BookOpen className="size-6" />
                                        </div>
                                        {materia.has_current_request && (
                                            <Badge className="gap-1 border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                                <CheckCircle2 className="size-3.5" /> Solicitada
                                            </Badge>
                                        )}
                                    </div>

                                    <div>
                                        <h2 className="text-xl font-bold text-[#2a3547] dark:text-white">{materia.nombre}</h2>
                                    </div>

                                    <div className="flex items-center gap-3 rounded-xl bg-[#f7f9fc] p-3 dark:bg-[#253047]">
                                        <Avatar className="size-10">
                                            <AvatarFallback className="bg-[#49beff]/15 font-bold text-[#1a9bd1] dark:text-[#49beff]">
                                                {getInitials(materia.docente.nombre_completo)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-xs font-medium text-[#7c8fac]">Docente</p>
                                            <p className="truncate text-sm font-semibold text-[#2a3547] dark:text-white">
                                                {materia.docente.nombre_completo}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-auto">
                                        {materia.has_current_request ? (
                                            <Button asChild variant="outline" className="w-full">
                                                <Link href="/libros/solicitudes">Ver mi solicitud</Link>
                                            </Button>
                                        ) : materia.can_request ? (
                                            <Button
                                                onClick={() => setSelectedMateria(materia)}
                                                className="w-full bg-[#5d87ff] text-white hover:bg-[#4d76e8]"
                                            >
                                                <Send className="size-4" /> Solicitar acceso
                                            </Button>
                                        ) : (
                                            <Button disabled variant="outline" className="w-full">
                                                No disponible
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </article>
                        ))}
                    </section>
                )}
            </main>

            {selectedMateria && (
                <SolicitudFormDialog
                    key={selectedMateria.id}
                    open={Boolean(selectedMateria)}
                    onOpenChange={(open) => {
                        if (!open) setSelectedMateria(null);
                    }}
                    materia={selectedMateria}
                />
            )}
        </AppLayout>
    );
}
