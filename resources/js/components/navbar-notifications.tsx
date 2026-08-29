import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertTriangle, BellRing, CalendarClock, FileCheck2, Scale, UserPlus, type LucideIcon } from 'lucide-react';

interface LegalNotification {
    title: string;
    description: string;
    time: string;
    icon: LucideIcon;
    color: string;
}

const notifications: LegalNotification[] = [
    {
        title: 'Audiencia próxima',
        description: 'La audiencia del expediente CIV-2026-041 inicia mañana.',
        time: '09:15',
        icon: CalendarClock,
        color: 'bg-[#5d87ff]/10 text-[#5d87ff]',
    },
    {
        title: 'Documento validado',
        description: 'El memorial del caso LAB-2026-018 fue firmado.',
        time: '10:40',
        icon: FileCheck2,
        color: 'bg-[#13deb9]/10 text-[#0f9f86]',
    },
    {
        title: 'Plazo procesal',
        description: 'Quedan dos días para responder el expediente FAM-0831.',
        time: '11:20',
        icon: AlertTriangle,
        color: 'bg-[#f6b51e]/10 text-[#b47a00]',
    },
    {
        title: 'Cliente registrado',
        description: 'Se añadió un nuevo cliente al Sistema Jurídico.',
        time: '13:05',
        icon: UserPlus,
        color: 'bg-[#49beff]/10 text-[#258ec8]',
    },
    {
        title: 'Expediente asignado',
        description: 'El proceso PEN-1924 tiene un nuevo responsable.',
        time: '15:30',
        icon: Scale,
        color: 'bg-[#ef4444]/10 text-[#ef4444]',
    },
];

export function NavbarNotifications() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-foreground relative size-10 rounded-full hover:bg-[#5d87ff]/10 hover:text-[#5d87ff]"
                    aria-label="Abrir notificaciones"
                >
                    <BellRing className="size-5" strokeWidth={1.8} />
                    <span className="ring-background absolute top-2 right-2 size-2 rounded-full bg-[#5d87ff] ring-2" aria-hidden="true" />
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="tailwind-admin-portal border-border w-[min(calc(100vw-2rem),340px)] overflow-hidden rounded-lg p-0 shadow-lg"
            >
                <div className="border-border flex items-center justify-between border-b px-5 py-4">
                    <h2 className="text-lg font-semibold">Notificaciones</h2>
                    <Badge className="border-0 bg-[#5d87ff]/10 text-[#5d87ff] hover:bg-[#5d87ff]/10">5 nuevas</Badge>
                </div>

                <div className="max-h-80 overflow-y-auto py-2 [scrollbar-width:thin]">
                    {notifications.map((notification) => (
                        <DropdownMenuItem
                            key={`${notification.title}-${notification.time}`}
                            className="items-start gap-3 rounded-none px-5 py-3 focus:bg-[#5d87ff]/10"
                        >
                            <span className={`flex size-10 shrink-0 items-center justify-center rounded-full ${notification.color}`}>
                                <notification.icon className="size-5" strokeWidth={1.8} />
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="flex items-center justify-between gap-2">
                                    <span className="truncate text-sm font-semibold">{notification.title}</span>
                                    <span className="text-muted-foreground shrink-0 text-[11px]">{notification.time}</span>
                                </span>
                                <span className="text-muted-foreground mt-0.5 block text-xs leading-5">{notification.description}</span>
                            </span>
                        </DropdownMenuItem>
                    ))}
                </div>

                <div className="border-border border-t p-4">
                    <Button type="button" variant="outline" className="w-full" disabled>
                        Ver todas las notificaciones
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
