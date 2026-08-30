import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { CircleAlert, ShieldPlus } from 'lucide-react';
import { type FormEvent } from 'react';

interface EditableRole {
    id: number;
    name: string;
}

interface RoleFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    role?: EditableRole | null;
}

function readableRoleName(name: string): string {
    return name
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

export function RoleFormDialog({ open, onOpenChange, role = null }: RoleFormDialogProps) {
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: role ? readableRoleName(role.name) : '',
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

        if (role) {
            put(`/roles/${role.id}`, options);
            return;
        }

        post('/roles', options);
    }

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!nextOpen) {
                    clearErrors();
                }
                onOpenChange(nextOpen);
            }}
        >
            <DialogContent className="tailwind-admin-portal overflow-hidden border-0 p-0 shadow-2xl sm:max-w-[520px]">
                <div className="border-border border-b bg-[#f7f9fc] px-7 py-6 dark:bg-[#253047]">
                    <DialogHeader>
                        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-[#5d87ff]/15 text-[#5d87ff]">
                            <ShieldPlus className="size-5" />
                        </div>
                        <DialogTitle className="text-foreground text-xl">{role ? 'Editar rol' : 'Crear rol'}</DialogTitle>
                        <DialogDescription className="sr-only">
                            {role ? 'Formulario para editar un rol.' : 'Formulario para crear un rol.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-6 px-7 py-6">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="role-name" className="text-foreground text-sm font-semibold">
                            Nombre
                        </label>
                        <Input
                            id="role-name"
                            value={data.name}
                            onChange={(event) => {
                                setData('name', event.target.value);
                                clearErrors('name');
                            }}
                            placeholder="Ej.: Abogado"
                            autoFocus
                            aria-invalid={Boolean(errors.name)}
                            aria-describedby={errors.name ? 'role-name-error' : undefined}
                            className={errors.name ? 'h-11 border-red-500 focus-visible:ring-red-200' : 'h-11'}
                        />
                        {errors.name && (
                            <p id="role-name-error" className="flex items-center gap-2 text-sm font-medium text-red-600" role="alert">
                                <CircleAlert className="size-4 shrink-0" />
                                {errors.name}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:space-x-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-[#5d87ff] text-white hover:bg-[#4d76e8]">
                            {processing ? 'Guardando...' : role ? 'Guardar' : 'Crear'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
