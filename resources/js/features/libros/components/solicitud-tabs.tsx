import { type EstadoSolicitud } from '@/features/libros/types';
import { Link } from '@inertiajs/react';

interface SolicitudTabsProps {
    current: EstadoSolicitud | null;
    baseUrl: string;
}

const tabs: Array<{ value: EstadoSolicitud | null; label: string }> = [
    { value: null, label: 'Todas' },
    { value: 'pendiente', label: 'Pendientes' },
    { value: 'aceptada', label: 'Aceptadas' },
    { value: 'rechazada', label: 'Rechazadas' },
];

export function SolicitudTabs({ current, baseUrl }: SolicitudTabsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
                <Link
                    key={tab.value ?? 'todas'}
                    href={tab.value ? `${baseUrl}?estado=${tab.value}` : baseUrl}
                    preserveScroll
                    preserveState
                    className={`inline-flex h-10 shrink-0 items-center rounded-lg px-4 text-sm font-semibold transition-colors ${
                        current === tab.value
                            ? 'bg-[#5d87ff] text-white shadow-sm'
                            : 'border border-[#dfe5ef] bg-white text-[#5a6a85] hover:border-[#5d87ff]/40 hover:text-[#5d87ff] dark:border-[#344159] dark:bg-[#1c2536] dark:text-[#aab7ca]'
                    }`}
                >
                    {tab.label}
                </Link>
            ))}
        </div>
    );
}
