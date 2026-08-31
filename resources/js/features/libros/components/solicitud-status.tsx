import { Badge } from '@/components/ui/badge';
import { type EstadoSolicitud } from '@/features/libros/types';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';

const statusConfig = {
    pendiente: {
        label: 'Pendiente',
        icon: Clock3,
        className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    },
    aceptada: {
        label: 'Aceptada',
        icon: CheckCircle2,
        className: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    },
    rechazada: {
        label: 'Rechazada',
        icon: XCircle,
        className: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
    },
} satisfies Record<EstadoSolicitud, { label: string; icon: typeof Clock3; className: string }>;

export function SolicitudStatus({ estado }: { estado: EstadoSolicitud }) {
    const config = statusConfig[estado];
    const Icon = config.icon;

    return (
        <Badge className={`gap-1.5 border-0 hover:opacity-100 ${config.className}`}>
            <Icon className="size-3.5" />
            {config.label}
        </Badge>
    );
}
