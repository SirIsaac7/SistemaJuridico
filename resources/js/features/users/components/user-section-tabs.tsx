import { Link, usePage } from '@inertiajs/react';
import { MonitorCog, UsersRound } from 'lucide-react';

interface UserSectionTabsProps {
    active: 'users' | 'device-reset-requests';
}

export function UserSectionTabs({ active }: UserSectionTabsProps) {
    const permissions = new Set((usePage().props as { auth?: { permissions?: string[] } }).auth?.permissions ?? []);
    const tabs = [
        {
            key: 'users' as const,
            label: 'Usuarios',
            href: '/users',
            icon: UsersRound,
            visible: permissions.has('usuarios.ver'),
        },
        {
            key: 'device-reset-requests' as const,
            label: 'Reseteos de dispositivo',
            href: '/users/device-reset-requests',
            icon: MonitorCog,
            visible: permissions.has('usuarios.resetear-dispositivo'),
        },
    ];

    return (
        <nav
            className="flex gap-2 overflow-x-auto rounded-xl border border-[#e5eaf2] bg-white p-1.5 shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]"
            aria-label="Secciones de usuarios"
        >
            {tabs
                .filter((tab) => tab.visible)
                .map((tab) => (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
                            active === tab.key
                                ? 'bg-[#5d87ff] text-white shadow-sm'
                                : 'text-[#5a6a85] hover:bg-[#5d87ff]/10 hover:text-[#5d87ff] dark:text-[#aab7ca]'
                        }`}
                    >
                        <tab.icon className="size-4" />
                        {tab.label}
                    </Link>
                ))}
        </nav>
    );
}
