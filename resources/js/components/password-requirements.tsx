import { cn } from '@/lib/utils';
import { Check, Circle } from 'lucide-react';

interface PasswordRequirementsProps {
    password: string;
}

const requirements = [
    { label: '8 caracteres como mínimo', matches: (password: string) => Array.from(password).length >= 8 },
    { label: 'Una letra mayúscula', matches: (password: string) => /\p{Lu}/u.test(password) },
    { label: 'Una letra minúscula', matches: (password: string) => /\p{Ll}/u.test(password) },
    { label: 'Un número', matches: (password: string) => /\p{N}/u.test(password) },
    { label: 'Un carácter especial', matches: (password: string) => /[\p{S}\p{P}]/u.test(password) },
] as const;

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
    const checks = requirements.map((requirement) => ({
        ...requirement,
        isMet: requirement.matches(password),
    }));
    const completed = checks.filter((requirement) => requirement.isMet).length;
    const percentage = completed * 20;
    const progressColor =
        completed === requirements.length ? 'bg-emerald-500' : completed >= 4 ? 'bg-[#5d87ff]' : completed >= 2 ? 'bg-amber-500' : 'bg-red-500';

    return (
        <div className="border-border bg-muted/30 grid gap-3 rounded-lg border p-3" aria-live="polite">
            <div className="flex items-center justify-between gap-3 text-xs font-medium">
                <span className="text-foreground">Seguridad de la contraseña</span>
                <span className={completed === requirements.length ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}>
                    {completed}/{requirements.length} requisitos
                </span>
            </div>

            <div
                role="progressbar"
                aria-label="Requisitos de seguridad completados"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
                className="bg-muted h-2 overflow-hidden rounded-full"
            >
                <div className={cn('h-full rounded-full transition-all duration-300 ease-out', progressColor)} style={{ width: `${percentage}%` }} />
            </div>

            <ul className="grid gap-2 text-xs sm:grid-cols-2">
                {checks.map((requirement) => (
                    <li
                        key={requirement.label}
                        className={cn(
                            'flex items-center gap-2 transition-colors duration-200',
                            requirement.isMet ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground',
                        )}
                    >
                        {requirement.isMet ? <Check className="size-3.5 shrink-0" /> : <Circle className="size-3.5 shrink-0" />}
                        <span>{requirement.label}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
