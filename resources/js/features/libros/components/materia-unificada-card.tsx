import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type MateriaUnificadaResumen } from '@/features/libros/types';
import { Link } from '@inertiajs/react';
import { CalendarDays, Files, Settings2, ShieldCheck, UserRound, UsersRound } from 'lucide-react';

export function MateriaUnificadaCard({ materia }: { materia: MateriaUnificadaResumen }) {
    const contextLabel = materia.context.can_manage
        ? 'Gestionas esta materia'
        : materia.context.has_granted_access
          ? 'Acceso concedido'
          : 'Supervisión';

    return (
        <article className="flex flex-col overflow-hidden rounded-2xl border border-[#e5eaf2] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg dark:border-[#2e3a50] dark:bg-[#1c2536]">
            <div className="h-1.5 bg-gradient-to-r from-[#5d87ff] to-[#49beff]" />
            <div className="flex flex-1 flex-col gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 className="truncate text-lg font-bold text-[#2a3547] dark:text-white">{materia.nombre}</h2>
                        <p className="mt-1 line-clamp-2 text-sm text-[#7c8fac]">{materia.descripcion || 'Sin descripción.'}</p>
                    </div>
                    <Badge className={materia.is_active ? 'border-0 bg-emerald-100 text-emerald-700' : 'border-0 bg-slate-100 text-slate-600'}>
                        {materia.is_active ? 'Activa' : 'Inhabilitada'}
                    </Badge>
                </div>

                <div className="rounded-xl bg-[#f6f9fc] p-3 dark:bg-[#152033]">
                    <p className="flex items-center gap-2 text-sm font-semibold text-[#2a3547] dark:text-white">
                        <UserRound className="size-4 text-[#5d87ff]" /> {materia.docente.nombre}
                    </p>
                    <p className="mt-1 pl-6 text-xs text-[#7c8fac]">{materia.docente.email}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-[#edf1f7] p-3 dark:border-[#2e3a50]">
                        <Files className="mb-2 size-5 text-[#49beff]" />
                        <p className="font-bold text-[#2a3547] dark:text-white">{materia.archivos_activos_count}</p>
                        <p className="text-xs text-[#7c8fac]">Archivos disponibles</p>
                    </div>
                    <div className="rounded-xl border border-[#edf1f7] p-3 dark:border-[#2e3a50]">
                        {materia.context.can_supervise ? (
                            <>
                                <UsersRound className="mb-2 size-5 text-[#13deb9]" />
                                <p className="font-bold text-[#2a3547] dark:text-white">{materia.estudiantes_activos_count}</p>
                                <p className="text-xs text-[#7c8fac]">Estudiantes vigentes</p>
                            </>
                        ) : materia.context.can_manage ? (
                            <>
                                <Settings2 className="mb-2 size-5 text-[#13deb9]" />
                                <p className="font-bold text-[#2a3547] dark:text-white">{materia.solicitudes_pendientes_count}</p>
                                <p className="text-xs text-[#7c8fac]">Solicitudes pendientes</p>
                            </>
                        ) : (
                            <>
                                <CalendarDays className="mb-2 size-5 text-[#13deb9]" />
                                <p className="truncate font-bold text-[#2a3547] dark:text-white">{materia.fecha_inicio || '—'}</p>
                                <p className="text-xs text-[#7c8fac]">Acceso desde</p>
                            </>
                        )}
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-3 pt-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7c8fac]">
                        <ShieldCheck className="size-3.5" /> {contextLabel}
                    </span>
                    <Button asChild size="sm" className="bg-[#5d87ff] text-white hover:bg-[#4d76e8]">
                        <Link href={`/libros/materias/${materia.id}`} prefetch>
                            {materia.context.can_manage ? 'Gestionar' : materia.context.has_granted_access ? 'Abrir' : 'Supervisar'}
                        </Link>
                    </Button>
                </div>
            </div>
        </article>
    );
}
