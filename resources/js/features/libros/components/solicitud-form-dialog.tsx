import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { type MateriaCatalogo } from '@/features/libros/types';
import { useForm } from '@inertiajs/react';
import { Send } from 'lucide-react';
import { type FormEvent } from 'react';

interface SolicitudFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    materia: MateriaCatalogo;
}

export function SolicitudFormDialog({ open, onOpenChange, materia }: SolicitudFormDialogProps) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        materia: '',
        universidad: '',
        observacion: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        post(`/libros/materias/${materia.id}/solicitudes`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
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
                        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-[#13deb9]/15 text-[#0a9b82] dark:text-[#13deb9]">
                            <Send className="size-5" />
                        </div>
                        <DialogTitle className="text-xl text-[#2a3547] dark:text-white">Solicitar acceso</DialogTitle>
                        <DialogDescription>
                            {materia.nombre} · {materia.docente.nombre_completo}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5 px-7 py-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="solicitud-universidad" className="text-sm font-semibold text-[#2a3547] dark:text-white">
                            Universidad
                        </label>
                        <Input
                            id="solicitud-universidad"
                            value={data.universidad}
                            onChange={(event) => setData('universidad', event.target.value)}
                            placeholder="Escribe el nombre de tu universidad"
                            autoFocus
                            className="h-11"
                        />
                        <InputError message={errors.universidad} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="solicitud-observacion" className="text-sm font-semibold text-[#2a3547] dark:text-white">
                            Observación <span className="font-normal text-[#7c8fac]">(opcional)</span>
                        </label>
                        <textarea
                            id="solicitud-observacion"
                            value={data.observacion}
                            onChange={(event) => setData('observacion', event.target.value)}
                            rows={4}
                            className="border-input bg-background focus-visible:ring-ring resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                        />
                        <InputError message={errors.observacion} />
                        <InputError message={errors.materia} />
                    </div>

                    <DialogFooter className="gap-2 pt-1 sm:space-x-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-[#5d87ff] text-white hover:bg-[#4d76e8]">
                            <Send className="size-4" />
                            {processing ? 'Enviando...' : 'Enviar solicitud'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
