import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from '@inertiajs/react';
import { UserRoundPlus } from 'lucide-react';
import { type FormEvent } from 'react';

export interface DocenteOption {
    id: number;
    name: string;
    email: string;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    docentes: DocenteOption[];
}

export function MateriaDocenteFormDialog({ open, onOpenChange, docentes }: Props) {
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm<{
        docente_id: number | null;
        nombre: string;
        descripcion: string;
    }>({
        docente_id: null,
        nombre: '',
        descripcion: '',
    });

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        post('/libros/materias-para-docentes', {
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
            <DialogContent className="tailwind-admin-portal overflow-hidden border-0 p-0 shadow-2xl sm:max-w-[600px]">
                <div className="border-border border-b bg-[#f7f9fc] px-7 py-6 dark:bg-[#253047]">
                    <DialogHeader>
                        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-[#5d87ff]/15 text-[#5d87ff]">
                            <UserRoundPlus className="size-5" />
                        </div>
                        <DialogTitle className="text-xl text-[#2a3547] dark:text-white">Crear materia para un docente</DialogTitle>
                        <DialogDescription>Selecciona el docente responsable y registra la materia que administrará.</DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5 px-7 py-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="materia-docente" className="text-sm font-semibold text-[#2a3547] dark:text-white">
                            Docente responsable
                        </label>
                        {docentes.length > 0 ? (
                            <Select value={data.docente_id?.toString() ?? ''} onValueChange={(value) => setData('docente_id', Number(value))}>
                                <SelectTrigger id="materia-docente" className="h-11 w-full">
                                    <SelectValue placeholder="Selecciona un docente" />
                                </SelectTrigger>
                                <SelectContent>
                                    {docentes.map((docente) => (
                                        <SelectItem key={docente.id} value={docente.id.toString()}>
                                            {docente.name} · {docente.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ) : (
                            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-200">
                                No existen usuarios docentes activos. Primero asigna el rol docente a un usuario.
                            </div>
                        )}
                        <InputError message={errors.docente_id} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="materia-docente-nombre" className="text-sm font-semibold text-[#2a3547] dark:text-white">
                            Nombre de la materia
                        </label>
                        <Input
                            id="materia-docente-nombre"
                            value={data.nombre}
                            onChange={(event) => setData('nombre', event.target.value)}
                            placeholder="Ej.: Derecho Penal"
                            className="h-11"
                        />
                        <InputError message={errors.nombre} />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="materia-docente-descripcion" className="text-sm font-semibold text-[#2a3547] dark:text-white">
                            Descripción <span className="font-normal text-[#7c8fac]">(opcional)</span>
                        </label>
                        <textarea
                            id="materia-docente-descripcion"
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
                        <Button type="submit" disabled={processing || docentes.length === 0} className="bg-[#5d87ff] text-white hover:bg-[#4d76e8]">
                            {processing ? 'Creando...' : 'Crear y asignar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
