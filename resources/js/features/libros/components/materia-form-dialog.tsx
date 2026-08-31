import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { BookPlus } from 'lucide-react';
import { type FormEvent } from 'react';

interface MateriaFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    materia?: { id: number; nombre: string; descripcion: string | null } | null;
}

export function MateriaFormDialog({ open, onOpenChange, materia = null }: MateriaFormDialogProps) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        nombre: materia?.nombre ?? '',
        descripcion: materia?.descripcion ?? '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        };

        if (materia) {
            put(`/libros/materias/${materia.id}`, options);
            return;
        }

        post('/libros/materias', options);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) clearErrors();
                onOpenChange(nextOpen);
            }}
        >
            <DialogContent className="tailwind-admin-portal overflow-hidden border-0 p-0 shadow-2xl sm:max-w-[560px]">
                <div className="border-border border-b bg-[#f7f9fc] px-7 py-6 dark:bg-[#253047]">
                    <DialogHeader>
                        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-[#5d87ff]/15 text-[#5d87ff]">
                            <BookPlus className="size-5" />
                        </div>
                        <DialogTitle className="text-xl text-[#2a3547] dark:text-white">{materia ? 'Editar materia' : 'Crear materia'}</DialogTitle>
                        <DialogDescription>
                            {materia ? 'Actualiza el nombre o la descripción.' : 'Crea una carpeta lógica para organizar tus archivos.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5 px-7 py-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="materia-nombre" className="text-sm font-semibold text-[#2a3547] dark:text-white">
                            Nombre de la materia
                        </label>
                        <Input
                            id="materia-nombre"
                            value={data.nombre}
                            onChange={(event) => setData('nombre', event.target.value)}
                            placeholder="Ej.: Derecho Penal"
                            autoFocus
                            className="h-11"
                        />
                        <InputError message={errors.nombre} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="materia-descripcion" className="text-sm font-semibold text-[#2a3547] dark:text-white">
                            Descripción <span className="font-normal text-[#7c8fac]">(opcional)</span>
                        </label>
                        <textarea
                            id="materia-descripcion"
                            value={data.descripcion}
                            onChange={(event) => setData('descripcion', event.target.value)}
                            rows={4}
                            placeholder="Describe brevemente el contenido de la materia."
                            className="border-input bg-background focus-visible:ring-ring resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        />
                        <InputError message={errors.descripcion} />
                    </div>

                    <DialogFooter className="gap-2 pt-1 sm:space-x-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-[#5d87ff] text-white hover:bg-[#4d76e8]">
                            {processing ? 'Guardando...' : materia ? 'Guardar cambios' : 'Crear materia'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
