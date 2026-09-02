import { PasswordRequirements } from '@/components/password-requirements';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ManagedUser, type UserRoleOption } from '@/features/users/types';
import { useForm } from '@inertiajs/react';
import { CircleAlert, UserRoundPlus } from 'lucide-react';
import { type FormEvent } from 'react';

interface UserFormDialogProps {
    open: boolean;
    roles: UserRoleOption[];
    user?: ManagedUser | null;
    onOpenChange: (open: boolean) => void;
}

interface FieldErrorProps {
    id: string;
    message?: string;
}

function FieldError({ id, message }: FieldErrorProps) {
    if (!message) {
        return null;
    }

    return (
        <p id={id} className="flex items-center gap-2 text-sm font-medium text-red-600" role="alert">
            <CircleAlert className="size-4 shrink-0" />
            {message}
        </p>
    );
}

export function UserFormDialog({ open, roles, user = null, onOpenChange }: UserFormDialogProps) {
    const isEditing = Boolean(user);
    const canAssignRole = !user || user.can.assign_role;
    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: user?.name ?? '',
        email: user?.email ?? '',
        role_id: canAssignRole && user?.role ? String(user.role.id) : '',
        password: '',
        password_confirmation: '',
    });

    function updateField(field: keyof typeof data, value: string) {
        setData(field, value);
        clearErrors(field);
    }

    function submit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onOpenChange(false);
            },
        };

        if (user) {
            put(`/users/${user.id}`, options);
            return;
        }

        post('/users', options);
    }

    const invalidInputClass = 'border-red-500 focus-visible:ring-red-200';

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
            <DialogContent className="tailwind-admin-portal max-h-[92vh] overflow-y-auto border-0 p-0 shadow-2xl sm:max-w-[640px]">
                <div className="border-border border-b bg-[#f7f9fc] px-6 py-6 sm:px-8 dark:bg-[#253047]">
                    <DialogHeader>
                        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-[#5d87ff]/15 text-[#5d87ff]">
                            <UserRoundPlus className="size-5" />
                        </div>
                        <DialogTitle className="text-foreground text-xl">{isEditing ? 'Editar usuario' : 'Crear usuario'}</DialogTitle>
                        <DialogDescription className="sr-only">
                            {isEditing ? 'Formulario para editar un usuario.' : 'Formulario para crear un usuario.'}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-5 px-6 py-6 sm:px-8">
                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <label htmlFor="user-name" className="text-foreground text-sm font-semibold">
                                Nombre completo
                            </label>
                            <Input
                                id="user-name"
                                value={data.name}
                                onChange={(event) => updateField('name', event.target.value)}
                                placeholder="Ej.: María López"
                                autoFocus
                                autoComplete="name"
                                aria-invalid={Boolean(errors.name)}
                                aria-describedby={errors.name ? 'user-name-error' : undefined}
                                className={`h-11 ${errors.name ? invalidInputClass : ''}`}
                            />
                            <FieldError id="user-name-error" message={errors.name} />
                        </div>

                        <div className="flex flex-col gap-2 sm:col-span-2">
                            <label htmlFor="user-email" className="text-foreground text-sm font-semibold">
                                Correo electrónico
                            </label>
                            <Input
                                id="user-email"
                                type="email"
                                value={data.email}
                                onChange={(event) => updateField('email', event.target.value)}
                                placeholder="nombre@correo.com"
                                autoComplete="email"
                                aria-invalid={Boolean(errors.email)}
                                aria-describedby={errors.email ? 'user-email-error' : undefined}
                                className={`h-11 ${errors.email ? invalidInputClass : ''}`}
                            />
                            <FieldError id="user-email-error" message={errors.email} />
                        </div>

                        {canAssignRole ? (
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <label htmlFor="user-role" className="text-foreground text-sm font-semibold">
                                    Rol
                                </label>
                                <Select value={data.role_id} onValueChange={(value) => updateField('role_id', value)}>
                                    <SelectTrigger
                                        id="user-role"
                                        aria-invalid={Boolean(errors.role_id)}
                                        className={`h-11 ${errors.role_id ? 'border-red-500 ring-red-200' : ''}`}
                                    >
                                        <SelectValue placeholder="Selecciona un rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {roles.map((role) => (
                                            <SelectItem key={role.id} value={String(role.id)}>
                                                {role.name
                                                    .split('-')
                                                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                                    .join(' ')}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError id="user-role-error" message={errors.role_id} />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 sm:col-span-2">
                                <span className="text-foreground text-sm font-semibold">Rol</span>
                                <div className="flex h-11 items-center rounded-md border border-[#dfe5ef] bg-[#f7f9fc] px-3 text-sm text-[#5a6a85]">
                                    {user?.role
                                        ? user.role.name
                                              .split('-')
                                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                              .join(' ')
                                        : 'Sin rol'}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2">
                            <label htmlFor="user-password" className="text-foreground text-sm font-semibold">
                                {isEditing ? 'Nueva contraseña' : 'Contraseña'}
                                {isEditing && <span className="text-muted-foreground font-normal"> (opcional)</span>}
                            </label>
                            <PasswordInput
                                id="user-password"
                                value={data.password}
                                onChange={(event) => updateField('password', event.target.value)}
                                autoComplete="new-password"
                                aria-invalid={Boolean(errors.password)}
                                className={`h-11 ${errors.password ? invalidInputClass : ''}`}
                            />
                            <FieldError id="user-password-error" message={errors.password} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="user-password-confirmation" className="text-foreground text-sm font-semibold">
                                Confirmar contraseña
                            </label>
                            <PasswordInput
                                id="user-password-confirmation"
                                value={data.password_confirmation}
                                onChange={(event) => updateField('password_confirmation', event.target.value)}
                                autoComplete="new-password"
                                className="h-11"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <PasswordRequirements password={data.password} />
                        </div>
                    </div>

                    <DialogFooter className="gap-2 pt-1 sm:space-x-0">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={processing} className="bg-[#5d87ff] text-white hover:bg-[#4d76e8]">
                            {processing ? 'Guardando...' : isEditing ? 'Guardar' : 'Crear usuario'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
