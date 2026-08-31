import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { type SolicitudRecibida } from '@/features/libros/types';
import { useForm } from '@inertiajs/react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { type FormEvent } from 'react';

interface RespuestaSolicitudDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    solicitud: SolicitudRecibida;
    action: 'aceptada' | 'rechazada';
}

export function RespuestaSolicitudDialog({ open, onOpenChange, solicitud, action }: RespuestaSolicitudDialogProps) {
    const isRejecting = action === 'rechazada';
    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        estado: action,
        motivo_respuesta: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        put(`/libros/solicitudes-recibidas/${solicitud.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        });
    }

    const Icon = isRejecting ? XCircle : CheckCircle2;

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
                        <div
                            className={`mb-3 flex size-11 items-center justify-center rounded-xl ${
                                isRejecting ? 'bg-red-500/12 text-red-500' : 'bg-emerald-500/12 text-emerald-500'
                            }`}
                        >
                            <Icon className="size-5" />
                        </div>
                        <DialogTitle className="text-xl text-[#2a3547] dark:text-white">
                            {isRejecting ? 'Rechazar solicitud' : 'Aceptar solicitud'}
                        </DialogTitle>
                        <DialogDescription>
                            {solicitud.estudiante.nombre_completo} solicita acceso a {solicitud.materia.nombre}.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5 px-7 py-6">
                    {isRejecting ? (
                        <div className="flex flex-col gap-2">
                            <label htmlFor="motivo-respuesta" className="text-sm font-semibold text-[#2a3547] dark:text-white">
                                Motivo del rechazo
                            </label>
                            <textarea
                                id="motivo-respuesta"
                                value={data.motivo_respuesta}
                                onChange={(event) => setData('motivo_respuesta', event.target.value)}
                                rows={4}
                                autoFocus
                                placeholder="Explica por qué no se aprobó la solicitud."
                                className="border-input bg-background focus-visible:ring-ring resize-none rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                            />
                            <InputError message={errors.motivo_respuesta} />
                        </div>
                    ) : (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
                            La solicitud quedará marcada como aceptada. La habilitación del contenido se conectará cuando implementemos los accesos
                            concedidos.
                        </div>
                    )}
                    <InputError message={errors.estado} />

                    <DialogFooter className="gap-2 pt-1 sm:space-x-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className={isRejecting ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-emerald-600 text-white hover:bg-emerald-700'}
                        >
                            <Icon className="size-4" />
                            {processing ? 'Guardando...' : isRejecting ? 'Rechazar' : 'Aceptar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
