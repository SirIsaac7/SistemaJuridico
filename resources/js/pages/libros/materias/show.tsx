import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArchivoFormDialog } from '@/features/libros/components/archivo-form-dialog';
import { EmptyLibrary } from '@/features/libros/components/empty-library';
import { LibrosModuleNav } from '@/features/libros/components/libros-module-nav';
import { LibrosPageHeader } from '@/features/libros/components/libros-page-header';
import { MateriaFormDialog } from '@/features/libros/components/materia-form-dialog';
import { type ArchivoLibro, type MateriaUnificadaDetalle } from '@/features/libros/types';
import AppLayout from '@/layouts/app-layout';
import { confirmAction } from '@/lib/sweet-alert';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Eye,
    File,
    FileImage,
    FileText,
    FileUp,
    Film,
    FolderOpen,
    GraduationCap,
    Mail,
    Pencil,
    Power,
    RotateCcw,
    ShieldCheck,
    UserRound,
    UsersRound,
} from 'lucide-react';
import { useState } from 'react';

interface Props {
    materia: MateriaUnificadaDetalle;
    context: {
        can_supervise: boolean;
        can_manage: boolean;
        has_granted_access: boolean;
    };
    can: {
        upload_file: boolean;
        update: boolean;
        update_status: boolean;
    };
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;

    return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

function FileTypeIcon({ tipo }: { tipo: ArchivoLibro['tipo'] }) {
    const Icon = tipo === 'video' ? Film : tipo === 'imagen' || tipo === 'flujograma' ? FileImage : tipo === 'pdf' ? FileText : File;

    return <Icon className="size-6" />;
}

export default function MateriaShow({ materia, context, can }: Props) {
    const [matterDialogOpen, setMatterDialogOpen] = useState(false);
    const [fileDialogOpen, setFileDialogOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<ArchivoLibro | null>(null);
    const [processingFileId, setProcessingFileId] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Libros', href: '/libros' },
        { title: materia.nombre, href: `/libros/materias/${materia.id}` },
    ];

    function openUpload() {
        setEditingFile(null);
        setFileDialogOpen(true);
    }

    function openEditFile(archivo: ArchivoLibro) {
        setEditingFile(archivo);
        setFileDialogOpen(true);
    }

    async function changeFileStatus(archivo: ArchivoLibro) {
        const activate = !archivo.is_active;
        const confirmed = await confirmAction({
            title: activate ? 'Reactivar archivo' : 'Inhabilitar archivo',
            text: activate
                ? `${archivo.titulo} volverá a estar disponible dentro de la materia.`
                : `${archivo.titulo} dejará de estar disponible, pero no se eliminará físicamente.`,
            confirmText: activate ? 'Reactivar' : 'Inhabilitar',
            tone: activate ? 'success' : 'danger',
        });

        if (!confirmed) return;

        router.put(
            `/libros/materias/${materia.id}/archivos/${archivo.id}/estado`,
            { is_active: activate },
            {
                preserveScroll: true,
                onStart: () => setProcessingFileId(archivo.id),
                onFinish: () => setProcessingFileId(null),
            },
        );
    }

    async function changeMatterStatus() {
        const activate = !materia.is_active;
        const confirmed = await confirmAction({
            title: activate ? 'Reactivar materia' : 'Inhabilitar materia',
            text: activate
                ? `${materia.nombre} y sus archivos volverán a estar disponibles.`
                : `${materia.nombre} y todos sus archivos dejarán de estar disponibles.`,
            confirmText: activate ? 'Reactivar' : 'Inhabilitar',
            tone: activate ? 'success' : 'danger',
        });

        if (!confirmed) return;

        router.put(`/libros/materias/${materia.id}/estado`, { is_active: activate }, { preserveScroll: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={materia.nombre} />

            <main className="flex min-w-0 flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <LibrosModuleNav />

                <Link href="/libros" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#5d87ff] hover:underline">
                    <ArrowLeft className="size-4" /> Volver a materias
                </Link>

                <LibrosPageHeader
                    eyebrow={context.can_manage ? 'Gestión de materia' : context.has_granted_access ? 'Materia habilitada' : 'Supervisión de materia'}
                    title={materia.nombre}
                    description={materia.descripcion || 'Esta materia no tiene una descripción registrada.'}
                    icon={<FolderOpen className="size-4" />}
                    actions={
                        <div className="flex flex-wrap gap-2">
                            {can.update && (
                                <Button variant="outline" onClick={() => setMatterDialogOpen(true)}>
                                    <Pencil className="size-4" /> Editar
                                </Button>
                            )}
                            {can.update_status && (
                                <Button
                                    variant="outline"
                                    onClick={() => void changeMatterStatus()}
                                    className={materia.is_active ? 'text-red-500' : 'text-emerald-600'}
                                >
                                    {materia.is_active ? <Power className="size-4" /> : <RotateCcw className="size-4" />}
                                    {materia.is_active ? 'Inhabilitar' : 'Reactivar'}
                                </Button>
                            )}
                            {can.upload_file && (
                                <Button onClick={openUpload} className="bg-[#5d87ff] text-white hover:bg-[#4d76e8]">
                                    <FileUp className="size-4" /> Subir archivo
                                </Button>
                            )}
                        </div>
                    }
                />

                <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    <article className="rounded-2xl border border-[#e5eaf2] bg-white p-5 shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#7c8fac] uppercase">
                            <UserRound className="size-4" /> Docente
                        </p>
                        <p className="mt-2 font-bold text-[#2a3547] dark:text-white">{materia.docente.nombre}</p>
                        <p className="mt-1 flex items-center gap-2 text-xs text-[#7c8fac]">
                            <Mail className="size-3.5" /> {materia.docente.email}
                        </p>
                    </article>

                    <article className="rounded-2xl border border-[#e5eaf2] bg-white p-5 shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                        <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#7c8fac] uppercase">
                            <ShieldCheck className="size-4" /> Estado
                        </p>
                        <p className={`mt-2 font-bold ${materia.is_active ? 'text-emerald-600 dark:text-emerald-300' : 'text-slate-500'}`}>
                            {materia.is_active ? 'Materia activa' : 'Materia inhabilitada'}
                        </p>
                    </article>

                    {materia.access ? (
                        <article className="rounded-2xl border border-[#e5eaf2] bg-white p-5 shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                            <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#7c8fac] uppercase">
                                <CalendarDays className="size-4" /> Vigencia de acceso
                            </p>
                            <p className="mt-2 font-bold text-[#2a3547] dark:text-white">Desde {materia.access.fecha_inicio || '—'}</p>
                            <p className="mt-1 text-xs text-[#7c8fac]">
                                {materia.access.fecha_fin ? `Hasta ${materia.access.fecha_fin}` : 'Sin vencimiento'}
                            </p>
                        </article>
                    ) : (
                        <article className="rounded-2xl border border-[#e5eaf2] bg-white p-5 shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                            <p className="flex items-center gap-2 text-xs font-semibold tracking-wide text-[#7c8fac] uppercase">
                                <CalendarDays className="size-4" /> Creada
                            </p>
                            <p className="mt-2 font-bold text-[#2a3547] dark:text-white">{materia.created_at || '—'}</p>
                        </article>
                    )}
                </section>

                {!materia.is_active && context.can_manage && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                        La materia está inhabilitada. Puedes revisar y editar sus archivos, pero no subir contenido hasta reactivarla.
                    </div>
                )}

                <section className="overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                    <div className="border-b border-[#e5eaf2] px-5 py-5 sm:px-7 dark:border-[#2e3a50]">
                        <h2 className="text-lg font-bold text-[#2a3547] dark:text-white">Archivos</h2>
                        <p className="mt-1 text-sm text-[#7c8fac]">
                            {context.can_manage || context.can_supervise
                                ? 'Se muestran los archivos registrados y su estado.'
                                : 'Se muestran únicamente los archivos activos disponibles para tu acceso.'}
                        </p>
                    </div>

                    {materia.archivos.length === 0 ? (
                        <div className="p-5">
                            <EmptyLibrary
                                title="No hay archivos disponibles"
                                description="Todavía no existen archivos visibles dentro de esta materia."
                            />
                        </div>
                    ) : (
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
                                                {(context.can_manage || context.can_supervise) && (
                                                    <Badge
                                                        className={
                                                            archivo.is_active
                                                                ? 'border-0 bg-emerald-100 text-emerald-700'
                                                                : 'border-0 bg-slate-100 text-slate-600'
                                                        }
                                                    >
                                                        {archivo.is_active ? 'Activo' : 'Inhabilitado'}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="mt-1 truncate text-sm text-[#7c8fac]">{archivo.nombre_original}</p>
                                            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#7c8fac]">
                                                <span className="uppercase">{archivo.tipo}</span>
                                                <span>{formatBytes(archivo.tamano_bytes)}</span>
                                                <span>{archivo.created_at || '—'}</span>
                                            </div>
                                            {archivo.descripcion && (
                                                <p className="mt-2 text-sm text-[#5a6a85] dark:text-[#aab7ca]">{archivo.descripcion}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2 lg:justify-end">
                                        {archivo.can.view && archivo.view_url && (
                                            <Button asChild variant="outline" size="sm">
                                                <a href={archivo.view_url} target="_blank" rel="noreferrer">
                                                    <Eye className="size-4" /> Ver
                                                </a>
                                            </Button>
                                        )}
                                        {archivo.can.update && (
                                            <Button variant="outline" size="sm" onClick={() => openEditFile(archivo)}>
                                                <Pencil className="size-4" /> Editar
                                            </Button>
                                        )}
                                        {archivo.can.update_status && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={processingFileId === archivo.id}
                                                onClick={() => void changeFileStatus(archivo)}
                                                className={
                                                    archivo.is_active ? 'text-red-500 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                                                }
                                            >
                                                {archivo.is_active ? <Power className="size-4" /> : <RotateCcw className="size-4" />}
                                                {archivo.is_active ? 'Inhabilitar' : 'Reactivar'}
                                            </Button>
                                        )}
                                    </div>
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                {materia.students !== null && (
                    <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                        <div className="flex items-center justify-between border-b border-[#e5eaf2] px-5 py-5 sm:px-7 dark:border-[#2e3a50]">
                            <div>
                                <h2 className="flex items-center gap-2 text-lg font-bold text-[#2a3547] dark:text-white">
                                    <UsersRound className="size-5 text-[#13deb9]" /> Estudiantes con acceso
                                </h2>
                                <p className="mt-1 text-sm text-[#7c8fac]">Accesos concedidos para esta materia.</p>
                            </div>
                            <Badge variant="secondary">{materia.students.length}</Badge>
                        </div>

                        {materia.students.length === 0 ? (
                            <div className="flex min-h-48 flex-col items-center justify-center gap-3 p-6 text-center">
                                <GraduationCap className="size-10 text-[#7c8fac]" />
                                <p className="text-sm text-[#7c8fac]">No existen estudiantes con acceso concedido.</p>
                            </div>
                        ) : (
                            <div className="max-w-full overflow-x-auto">
                                <table className="w-full min-w-[850px] text-left text-sm">
                                    <thead className="bg-[#f6f9fc] text-xs font-semibold tracking-wide text-[#5a6a85] uppercase dark:bg-[#152033]">
                                        <tr>
                                            <th className="px-5 py-3">Estudiante</th>
                                            <th className="px-5 py-3">Universidad</th>
                                            <th className="px-5 py-3">Inicio</th>
                                            <th className="px-5 py-3">Fin</th>
                                            <th className="px-5 py-3">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#edf1f7] dark:divide-[#2e3a50]">
                                        {materia.students.map((student) => (
                                            <tr key={student.id} className="text-[#5a6a85] dark:text-[#aab7ca]">
                                                <td className="px-5 py-4">
                                                    <p className="font-semibold text-[#2a3547] dark:text-white">{student.estudiante.nombre}</p>
                                                    <p className="mt-1 text-xs text-[#7c8fac]">{student.estudiante.email}</p>
                                                </td>
                                                <td className="px-5 py-4">{student.universidad}</td>
                                                <td className="px-5 py-4">{student.fecha_inicio || '—'}</td>
                                                <td className="px-5 py-4">{student.fecha_fin || 'Sin vencimiento'}</td>
                                                <td className="px-5 py-4">
                                                    <Badge
                                                        className={
                                                            student.is_current
                                                                ? 'border-0 bg-emerald-100 text-emerald-700'
                                                                : 'border-0 bg-slate-100 text-slate-600'
                                                        }
                                                    >
                                                        {student.is_current ? 'Vigente' : 'No vigente'}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>
                )}
            </main>

            {matterDialogOpen && <MateriaFormDialog open={matterDialogOpen} onOpenChange={setMatterDialogOpen} materia={materia} />}
            {fileDialogOpen && (
                <ArchivoFormDialog
                    key={editingFile?.id ?? 'upload'}
                    open={fileDialogOpen}
                    onOpenChange={setFileDialogOpen}
                    materiaId={materia.id}
                    archivo={editingFile}
                />
            )}
        </AppLayout>
    );
}
