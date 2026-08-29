import { Badge } from '@/components/ui/badge';

import { CardBox } from './card-box';

const cases = [
    {
        lawyer: 'María Fernández',
        role: 'Abogada senior',
        caseName: 'Pérez c/ Empresa Andina',
        priority: 'Baja',
        badge: 'bg-[#5d87ff] text-white',
        fees: 'Bs 3.900',
    },
    {
        lawyer: 'Carlos Mendoza',
        role: 'Socio responsable',
        caseName: 'Inmobiliaria Norte S.R.L.',
        priority: 'Media',
        badge: 'bg-[#49beff] text-white',
        fees: 'Bs 24.500',
    },
    {
        lawyer: 'Lucía Vargas',
        role: 'Abogada litigante',
        caseName: 'Ministerio Público c/ Rojas',
        priority: 'Alta',
        badge: 'bg-[#ef4444] text-white',
        fees: 'Bs 12.800',
    },
    {
        lawyer: 'Diego Salazar',
        role: 'Asesor corporativo',
        caseName: 'Contrato Grupo Altiplano',
        priority: 'Crítica',
        badge: 'bg-[#13a98e] text-white',
        fees: 'Bs 4.800',
    },
    {
        lawyer: 'Ana Torres',
        role: 'Abogada asociada',
        caseName: 'Asistencia familiar Flores',
        priority: 'Baja',
        badge: 'bg-[#5d87ff] text-white',
        fees: 'Bs 9.300',
    },
] as const;

export function CasePerformance() {
    return (
        <CardBox className="h-full">
            <div id="case-table" className="mb-6">
                <h2 className="text-lg font-semibold">Rendimiento de expedientes</h2>
                <p className="text-muted-foreground text-sm font-normal">Vista general de causas y responsables</p>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] caption-bottom text-sm">
                    <thead>
                        <tr className="border-border border-b text-left">
                            <th className="h-10 px-2 font-semibold">Id</th>
                            <th className="h-10 px-2 font-semibold">Responsable</th>
                            <th className="h-10 px-2 font-semibold">Expediente</th>
                            <th className="h-10 px-2 font-semibold">Prioridad</th>
                            <th className="h-10 px-2 font-semibold">Honorarios</th>
                        </tr>
                    </thead>
                    <tbody>
                        {cases.map((item, index) => (
                            <tr key={item.caseName} className="border-border border-b last:border-0">
                                <td className="text-muted-foreground p-4 text-sm font-medium whitespace-nowrap">{index + 1}</td>
                                <td className="min-w-[200px] p-4 whitespace-nowrap">
                                    <p className="mb-1 text-sm font-semibold">{item.lawyer}</p>
                                    <p className="text-muted-foreground text-xs font-medium">{item.role}</p>
                                </td>
                                <td className="text-muted-foreground p-4 text-sm font-medium whitespace-nowrap">{item.caseName}</td>
                                <td className="p-4 whitespace-nowrap">
                                    <Badge className={`justify-center rounded-full border-0 px-3 py-0.5 text-[13px] ${item.badge}`}>
                                        {item.priority}
                                    </Badge>
                                </td>
                                <td className="text-muted-foreground p-4 text-[15px] font-medium whitespace-nowrap">{item.fees}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </CardBox>
    );
}
