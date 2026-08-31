import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArchivoFormDialog } from '@/features/libros/components/archivo-form-dialog';
import { EmptyLibrary } from '@/features/libros/components/empty-library';
import { LibrosPageHeader } from '@/features/libros/components/libros-page-header';
import { MateriaFormDialog } from '@/features/libros/components/materia-form-dialog';
import { type ArchivoLibro, type MateriaDetalle } from '@/features/libros/types';
import AppLayout from '@/layouts/app-layout';
import { confirmAction } from '@/lib/sweet-alert';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, Eye, File, FileImage, FileText, FileUp, Film, FolderOpen, Pencil, Power, RotateCcw } from 'lucide-react';
import { useState } from 'react';

interface MateriaShowProps {
    materia: MateriaDetalle;
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

export default function MateriaShow({ materia, can }: MateriaShowProps) {
    const [matterDialogOpen, setMatterDialogOpen] = useState(false);
    const [fileDialogOpen, setFileDialogOpen] = useState(false);
    const [editingFile, setEditingFile] = useState<ArchivoLibro | null>(null);
    const [processingFileId, setProcessingFileId] = useState<number | null>(null);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Libros', href: '/libros' },
        { title: 'Mis materias', href: '/libros/materias' },
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

            <main className="flex flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <Link href="/libros/materias" className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-[#5d87ff] hover:underline">
                    <ArrowLeft className="size-4" /> Volver a mis materias
                </Link>

                <LibrosPageHeader
                    eyebrow="Materia"
                    title={materia.nombre}
                    description={materia.descripcion || 'Administra los archivos privados de esta materia.'}
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

                {!materia.is_active && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                        Esta materia está inhabilitada. Puedes revisar y editar sus archivos, pero no subir contenido nuevo hasta reactivarla.
                    </div>
                )}

                {materia.archivos.length === 0 ? (
                    <EmptyLibrary
                        title="Esta materia todavía no tiene archivos"
                        description="Sube PDF, imágenes, videos, flujogramas, documentos u otros recursos."
                    />
                ) : (
                    <section className="overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                        <div className="border-b border-[#e5eaf2] px-5 py-5 sm:px-7 dark:border-[#2e3a50]">
                            <h2 className="text-lg font-bold text-[#2a3547] dark:text-white">Archivos</h2>
                            <p className="mt-1 text-sm text-[#7c8fac]">
                                {materia.archivos.length === 1 ? '1 archivo registrado' : `${materia.archivos.length} archivos registrados`}
                            </p>
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
                                                <h3 className="truncate font-bold text-[#2a3547] dark:text-white">{archivo.titulo}</h3>
                                                <Badge
                                                    className={`border-0 ${
                                                        archivo.is_active
                                                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300'
                                                    }`}
                                                >
                                                    {archivo.is_active ? 'Activo' : 'Inhabilitado'}
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

                                    <div className="flex flex-wrap gap-2 lg:justify-end">
                                        {archivo.can.view && (
                                            <Button asChild variant="outline" size="sm">
                                                <a
                                                    href={`/libros/materias/${materia.id}/archivos/${archivo.id}/contenido`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                >
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
