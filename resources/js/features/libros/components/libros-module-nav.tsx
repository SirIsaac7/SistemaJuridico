import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, ClipboardList, LibraryBig, UsersRound } from 'lucide-react';

interface ModuleLink {
    title: string;
    href: string;
    permission?: string;
    icon: typeof BookOpen;
}

const links: ModuleLink[] = [
    { title: 'Materias', href: '/libros', icon: BookOpen },
    { title: 'Catálogo', href: '/libros/catalogo', permission: 'libros.catalogo.ver', icon: LibraryBig },
    { title: 'Mis solicitudes', href: '/libros/solicitudes', permission: 'libros.solicitudes.ver-propias', icon: ClipboardList },
    {
        title: 'Solicitudes recibidas',
        href: '/libros/solicitudes-recibidas',
        permission: 'libros.solicitudes.ver-recibidas',
        icon: UsersRound,
    },
];

export function LibrosModuleNav() {
    const page = usePage<SharedData>();
    const currentPath = page.url.split('?')[0];
    const permissions = new Set(page.props.auth.permissions);
    const visibleLinks = links.filter((link) => !link.permission || permissions.has(link.permission));

    return (
        <nav className="max-w-full overflow-x-auto rounded-xl border border-[#e5eaf2] bg-white p-1.5 shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
            <div className="flex min-w-max gap-1">
                {visibleLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = link.href === '/libros' ? currentPath === link.href : currentPath.startsWith(link.href);

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            prefetch
                            className={`inline-flex h-10 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
                                isActive
                                    ? 'bg-[#5d87ff] text-white shadow-sm'
                                    : 'text-[#5a6a85] hover:bg-[#5d87ff]/10 hover:text-[#5d87ff] dark:text-[#aab7ca]'
                            }`}
                        >
                            <Icon className="size-4" />
                            {link.title}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
