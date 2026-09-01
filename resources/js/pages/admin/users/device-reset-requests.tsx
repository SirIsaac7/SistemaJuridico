import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserSectionTabs } from '@/features/users/components/user-section-tabs';
import AppLayout from '@/layouts/app-layout';
import { confirmAction } from '@/lib/sweet-alert';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, ChevronLeft, ChevronRight, Inbox, LoaderCircle, MonitorCog, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DeviceResetRequest {
    id: number;
    email: string;
    estado: 'pendiente' | 'aprobada';
    created_at: string | null;
    fecha_respuesta: string | null;
    can_approve: boolean;
}

interface PaginatedRequests {
    data: DeviceResetRequest[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
}

interface RequestFilters {
    search: string;
    status: 'all' | 'pendiente' | 'aprobada';
}

interface RequestCounts {
    all: number;
    pending: number;
    approved: number;
}

interface DeviceResetRequestsProps {
    requests: PaginatedRequests;
    filters: RequestFilters;
    counts: RequestCounts;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Usuarios', href: '/users' },
    { title: 'Reseteos de dispositivo', href: '/users/device-reset-requests' },
];

export default function DeviceResetRequests({ requests, filters, counts }: DeviceResetRequestsProps) {
    const [search, setSearch] = useState(filters.search);
    const [isSearching, setIsSearching] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        const normalizedSearch = search.trim();

        if (normalizedSearch === filters.search) {
            return;
        }

        const timeout = window.setTimeout(() => {
            router.get(
                '/users/device-reset-requests',
                {
                    search: normalizedSearch || undefined,
                    status: filters.status === 'pendiente' ? undefined : filters.status,
                },
                {
                    only: ['requests', 'filters', 'counts'],
                    preserveState: true,
                    preserveScroll: true,
                    replace: true,
                    onStart: () => setIsSearching(true),
                    onFinish: () => setIsSearching(false),
                },
            );
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [filters.search, filters.status, search]);

    function visit(nextFilters: Partial<RequestFilters>) {
        const next = { ...filters, search: search.trim(), ...nextFilters };

        router.get(
            '/users/device-reset-requests',
            {
                search: next.search || undefined,
                status: next.status === 'pendiente' ? undefined : next.status,
            },
            {
                only: ['requests', 'filters', 'counts'],
                preserveState: true,
                preserveScroll: true,
                replace: true,
                onStart: () => setIsSearching(true),
                onFinish: () => setIsSearching(false),
            },
        );
    }

    async function approve(request: DeviceResetRequest) {
        const confirmed = await confirmAction({
            title: 'Aprobar reseteo',
            text: `Se desvinculará el dispositivo actual de ${request.email} y se cerrarán todas sus sesiones activas.`,
            confirmText: 'Aprobar reseteo',
            icon: 'warning',
            tone: 'danger',
        });

        if (!confirmed) {
            return;
        }

        router.post(
            `/users/device-reset-requests/${request.id}/approval`,
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessingId(request.id),
                onFinish: () => setProcessingId(null),
            },
        );
    }

    const statusFilters: Array<{ key: RequestFilters['status']; label: string; count: number }> = [
        { key: 'pendiente', label: 'Pendientes', count: counts.pending },
        { key: 'aprobada', label: 'Aprobadas', count: counts.approved },
        { key: 'all', label: 'Todas', count: counts.all },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Reseteos de dispositivo" />

            <main className="flex min-w-0 flex-1 flex-col gap-6 bg-[#f6f9fc] p-4 sm:p-6 lg:p-8 dark:bg-[#152033]">
                <section className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-[#5d87ff]">
                        <MonitorCog className="size-4" />
                        Administración de usuarios
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-[#2a3547] sm:text-3xl dark:text-white">Reseteos de dispositivo</h1>
                    <p className="text-sm text-[#5a6a85] dark:text-[#aab7ca]">Revisa las solicitudes enviadas desde el inicio de sesión.</p>
                </section>

                <UserSectionTabs active="device-reset-requests" />

                <section className="min-w-0 overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm dark:border-[#2e3a50] dark:bg-[#1c2536]">
                    <div className="flex flex-col gap-5 border-b border-[#e5eaf2] px-5 py-5 sm:px-7 dark:border-[#2e3a50]">
                        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                            <div>
                                <h2 className="text-lg font-semibold text-[#2a3547] dark:text-white">Solicitudes de reseteo</h2>
                                <p className="mt-1 text-sm text-[#7c8fac]">
                                    {requests.total === 1 ? '1 solicitud encontrada' : `${requests.total} solicitudes encontradas`}
                                </p>
                            </div>

                            <div className="relative w-full lg:w-96">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-[#7c8fac]" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Buscar por correo..."
                                    aria-label="Buscar solicitudes por correo"
                                    className="h-10 border-[#dfe5ef] pr-9 pl-9 dark:border-[#3a465c]"
                                />
                                {isSearching ? (
                                    <LoaderCircle className="absolute top-1/2 right-3 size-4 -translate-y-1/2 animate-spin text-[#5d87ff]" />
                                ) : search ? (
                                    <button
                                        type="button"
                                        onClick={() => setSearch('')}
                                        aria-label="Limpiar búsqueda"
                                        className="absolute top-1/2 right-3 -translate-y-1/2 text-[#7c8fac] hover:text-[#2a3547]"
                                    >
                                        <X className="size-4" />
                                    </button>
                                ) : null}
                            </div>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {statusFilters.map((item) => (
                                <button
                                    key={item.key}
                                    type="button"
                                    onClick={() => visit({ status: item.key })}
                                    className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                                        filters.status === item.key
                                            ? 'bg-[#5d87ff] text-white'
                                            : 'bg-[#f2f6fa] text-[#5a6a85] hover:bg-[#5d87ff]/10 hover:text-[#5d87ff] dark:bg-[#263248] dark:text-[#aab7ca]'
                                    }`}
                                >
                                    {item.label}
                                    <span className={filters.status === item.key ? 'text-white/80' : 'text-[#7c8fac]'}>{item.count}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="min-w-0 overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left text-sm">
                            <thead className="bg-[#f8fafc] text-xs font-semibold tracking-wide text-[#5a6a85] uppercase dark:bg-[#202b3f] dark:text-[#aab7ca]">
                                <tr>
                                    <th className="px-6 py-4">Correo</th>
                                    <th className="px-6 py-4">Solicitud</th>
                                    <th className="px-6 py-4">Estado</th>
                                    <th className="px-6 py-4">Respuesta</th>
                                    <th className="px-6 py-4 text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#edf1f7] dark:divide-[#2e3a50]">
                                {requests.data.map((request) => (
                                    <tr
                                        key={request.id}
                                        className="text-[#2a3547] transition-colors hover:bg-[#f8fbff] dark:text-[#d5deeb] dark:hover:bg-[#202b3f]"
                                    >
                                        <td className="px-6 py-4 font-semibold">{request.email}</td>
                                        <td className="px-6 py-4 text-[#7c8fac]">{request.created_at}</td>
                                        <td className="px-6 py-4">
                                            <Badge
                                                className={
                                                    request.estado === 'pendiente'
                                                        ? 'bg-amber-100 text-amber-700 hover:bg-amber-100'
                                                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                }
                                            >
                                                {request.estado === 'pendiente' ? 'Pendiente' : 'Aprobada'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-[#7c8fac]">{request.fecha_respuesta ?? '—'}</td>
                                        <td className="px-6 py-4 text-right">
                                            {request.can_approve ? (
                                                <Button
                                                    size="sm"
                                                    onClick={() => void approve(request)}
                                                    disabled={processingId === request.id}
                                                    className="bg-[#5d87ff] text-white hover:bg-[#4d76e8]"
                                                >
                                                    {processingId === request.id ? (
                                                        <LoaderCircle className="size-4 animate-spin" />
                                                    ) : (
                                                        <CheckCircle2 className="size-4" />
                                                    )}
                                                    Aprobar reseteo
                                                </Button>
                                            ) : (
                                                <span className="text-[#bdc7d8]">—</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {requests.data.length === 0 && (
                        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
                            <div className="flex size-14 items-center justify-center rounded-full bg-[#5d87ff]/10 text-[#5d87ff]">
                                <Inbox className="size-6" />
                            </div>
                            <p className="font-semibold text-[#2a3547] dark:text-white">No hay solicitudes en esta sección</p>
                            <p className="text-sm text-[#7c8fac]">Las nuevas solicitudes aparecerán aquí.</p>
                        </div>
                    )}

                    {requests.last_page > 1 && (
                        <div className="flex flex-col items-center justify-between gap-3 border-t border-[#e5eaf2] px-5 py-4 sm:flex-row sm:px-7 dark:border-[#2e3a50]">
                            <p className="text-sm text-[#7c8fac]">
                                Mostrando {requests.from}–{requests.to} de {requests.total}
                            </p>
                            <div className="flex gap-2">
                                {requests.prev_page_url ? (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={requests.prev_page_url} preserveScroll>
                                            <ChevronLeft className="size-4" /> Anterior
                                        </Link>
                                    </Button>
                                ) : null}
                                {requests.next_page_url ? (
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={requests.next_page_url} preserveScroll>
                                            Siguiente <ChevronRight className="size-4" />
                                        </Link>
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    )}
                </section>
            </main>
        </AppLayout>
    );
}
