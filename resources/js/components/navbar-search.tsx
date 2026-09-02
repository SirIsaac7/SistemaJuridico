import { Input } from '@/components/ui/input';
import { Link } from '@inertiajs/react';
import { KeyRound, LayoutDashboard, Search, UserRound, type LucideIcon } from 'lucide-react';
import { useMemo, useState } from 'react';

interface SearchItem {
    title: string;
    description: string;
    href: string;
    icon: LucideIcon;
}

const searchItems: SearchItem[] = [
    { title: 'Panel principal', description: 'Resumen del Sistema Jurídico', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Mi perfil', description: 'Datos personales de la cuenta', href: '/settings/profile', icon: UserRound },
    { title: 'Contraseña', description: 'Seguridad y acceso', href: '/settings/password', icon: KeyRound },
];

interface NavbarSearchProps {
    placeholder?: string;
}

export function NavbarSearch({ placeholder = 'Buscar en el sistema...' }: NavbarSearchProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const results = useMemo(() => {
        const normalizedQuery = query.trim().toLocaleLowerCase('es');

        if (!normalizedQuery) {
            return [];
        }

        return searchItems.filter((item) => `${item.title} ${item.description}`.toLocaleLowerCase('es').includes(normalizedQuery));
    }, [query]);

    return (
        <div
            className="relative w-full max-w-xs"
            onBlur={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget)) {
                    setIsOpen(false);
                }
            }}
        >
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 z-1 size-[18px] -translate-y-1/2" />
            <Input
                type="search"
                value={query}
                placeholder={placeholder}
                aria-label="Buscar en el Sistema Jurídico"
                autoComplete="off"
                className="border-border bg-background h-10 rounded-xl pr-4 pl-10 shadow-none focus-visible:border-[#5d87ff] focus-visible:ring-[#5d87ff]/20"
                onFocus={() => setIsOpen(true)}
                onChange={(event) => {
                    setQuery(event.target.value);
                    setIsOpen(true);
                }}
            />

            {isOpen && query.trim() && (
                <div className="border-border bg-popover text-popover-foreground absolute top-12 left-0 z-50 w-full overflow-hidden rounded-lg border p-2 shadow-lg">
                    {results.length > 0 ? (
                        <div className="flex flex-col gap-1">
                            {results.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    prefetch
                                    className="flex items-center gap-3 rounded-md p-2.5 text-sm transition-colors hover:bg-[#5d87ff]/10 hover:text-[#5d87ff]"
                                    onClick={() => {
                                        setQuery('');
                                        setIsOpen(false);
                                    }}
                                >
                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#5d87ff]/10 text-[#5d87ff]">
                                        <item.icon className="size-[18px]" strokeWidth={1.8} />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block font-semibold">{item.title}</span>
                                        <span className="text-muted-foreground block truncate text-xs">{item.description}</span>
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground px-3 py-6 text-center text-sm">No se encontraron resultados.</p>
                    )}
                </div>
            )}
        </div>
    );
}
