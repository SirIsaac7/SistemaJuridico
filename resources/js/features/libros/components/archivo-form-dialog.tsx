import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ArchivoLibro, type TipoArchivo } from '@/features/libros/types';
import { useForm } from '@inertiajs/react';
import { FileUp } from 'lucide-react';
import { type FormEvent } from 'react';

const tipos: Array<{ value: TipoArchivo; label: string }> = [
    { value: 'pdf', label: 'PDF' },
    { value: 'video', label: 'Video' },
    { value: 'imagen', label: 'Imagen' },
];

const acceptedFiles: Record<'pdf' | 'video' | 'imagen', string> = {
    pdf: '.pdf,application/pdf',
    imagen: '.jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp',
    video: '.mp4,.m4v,.mov,.webm,.ogv,video/mp4,video/quicktime,video/webm,video/ogg',
};

interface ArchivoFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    materiaId: number;
    archivo?: ArchivoLibro | null;
}

export function ArchivoFormDialog({ open, onOpenChange, materiaId, archivo = null }: ArchivoFormDialogProps) {
    const { data, setData, post, put, processing, progress, errors, reset, clearErrors } = useForm<{
        titulo: string;
        descripcion: string;
        tipo: TipoArchivo;
        archivo: File | null;
    }>({
        titulo: archivo?.titulo ?? '',
        descripcion: archivo?.descripcion ?? '',
        tipo: archivo?.tipo ?? 'pdf',
        archivo: null,
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            forceFormData: !archivo,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        };

        if (archivo) {
            put(`/libros/materias/${materiaId}/archivos/${archivo.id}`, options);
            return;
        }

        post(`/libros/materias/${materiaId}/archivos`, options);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) clearErrors();
                onOpenChange(nextOpen);
            }}
        >
            <DialogContent className="tailwind-admin-portal max-h-[90vh] overflow-y-auto border-0 p-0 shadow-2xl sm:max-w-[620px]">
                <div className="border-border border-b bg-[#f7f9fc] px-7 py-6 dark:bg-[#253047]">
                    <DialogHeader>
                        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-[#49beff]/15 text-[#49beff]">
                            <FileUp className="size-5" />
                        </div>
                        <DialogTitle className="text-xl text-[#2a3547] dark:text-white">{archivo ? 'Editar archivo' : 'Subir archivo'}</DialogTitle>
                        <DialogDescription>
                            {archivo ? 'Modifica la información visible del archivo.' : 'El archivo se guardará en almacenamiento privado.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5 px-7 py-6">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <label htmlFor="archivo-titulo" className="text-sm font-semibold text-[#2a3547] dark:text-white">
                                Título
                            </label>
                            <Input
                                id="archivo-titulo"
                                value={data.titulo}
                                onChange={(event) => setData('titulo', event.target.value)}
                                placeholder="Ej.: Código Penal actualizado"
                                className="h-11"
                            />
                            <InputError message={errors.titulo} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-semibold text-[#2a3547] dark:text-white">Tipo</label>
                            <Select value={data.tipo} disabled={Boolean(archivo)} onValueChange={(value: TipoArchivo) => setData('tipo', value)}>
                                <SelectTrigger className="h-11">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="tailwind-admin-portal">
                                    {tipos.map((tipo) => (
                                        <SelectItem key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <InputError message={errors.tipo} />
                        </div>

                        {!archivo && (
                            <div className="flex flex-col gap-2">
                                <label htmlFor="archivo-file" className="text-sm font-semibold text-[#2a3547] dark:text-white">
                                    Archivo
                                </label>
                                <Input
                                    id="archivo-file"
                                    type="file"
                                    accept={acceptedFiles[data.tipo as keyof typeof acceptedFiles]}
                                    onChange={(event) => setData('archivo', event.target.files?.[0] ?? null)}
                                    className="h-11 cursor-pointer pt-2"
                                />
                                <InputError message={errors.archivo} />
                            </div>
                        )}

                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <label htmlFor="archivo-descripcion" className="text-sm font-semibold text-[#2a3547] dark:text-white">
                                Descripción <span className="font-normal text-[#7c8fac]">(opcional)</span>
                            </label>
                            <textarea
                                id="archivo-descripcion"
                                value={data.descripcion}
                                onChange={(event) => setData('descripcion', event.target.value)}
                                rows={4}
                                className="border-input bg-background focus-visible:ring-ring resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                            />
                            <InputError message={errors.descripcion} />
                        </div>
                    </div>

                    {progress && (
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between text-xs font-semibold text-[#5a6a85] dark:text-[#aab7ca]">
                                <span>Subiendo archivo</span>
                                <span>{progress.percentage}%</span>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-[#eef2f7] dark:bg-[#253047]">
                                <div className="h-full rounded-full bg-[#5d87ff] transition-all" style={{ width: `${progress.percentage}%` }} />
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-1 sm:space-x-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-[#5d87ff] text-white hover:bg-[#4d76e8]">
                            {processing ? (archivo ? 'Guardando...' : 'Subiendo...') : archivo ? 'Guardar cambios' : 'Subir archivo'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
