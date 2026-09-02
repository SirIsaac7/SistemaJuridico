import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react';
import * as React from 'react';

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, 'type'>;

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(({ className, disabled, id, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);

    return (
        <div className="relative">
            <Input
                {...props}
                id={id}
                ref={ref}
                type={isVisible ? 'text' : 'password'}
                disabled={disabled}
                className={cn('pr-11', className)}
            />
            <button
                type="button"
                disabled={disabled}
                aria-controls={id}
                aria-label={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                aria-pressed={isVisible}
                title={isVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                onClick={() => setIsVisible((visible) => !visible)}
                className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
            >
                <span className="relative size-4" aria-hidden="true">
                    <Eye
                        className={cn(
                            'absolute inset-0 size-4 transition-all duration-200 ease-out',
                            isVisible ? 'scale-75 rotate-12 opacity-0' : 'scale-100 rotate-0 opacity-100',
                        )}
                    />
                    <EyeOff
                        className={cn(
                            'absolute inset-0 size-4 transition-all duration-200 ease-out',
                            isVisible ? 'scale-100 rotate-0 opacity-100' : 'scale-75 -rotate-12 opacity-0',
                        )}
                    />
                </span>
            </button>
        </div>
    );
});

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };
