import { CardBox } from './card-box';

const timeline = [
    { time: '09:30', description: 'Se registró el memorial del expediente LAB-2026-018', color: 'border-[#5d87ff]' },
    { time: '10:00', description: 'Nueva audiencia programada', reference: '#AUD-3467', color: 'border-[#8754ec]' },
    { time: '12:00', description: 'Se notificó a las partes del proceso CIV-2026-041', color: 'border-[#13deb9]' },
    { time: '14:30', description: 'Nuevo expediente asignado', reference: '#PEN-1924', color: 'border-[#f6b51e]' },
    { time: '15:15', description: 'Plazo procesal próximo a vencer', reference: '#FAM-0831', color: 'border-[#ef4444]' },
    { time: '16:00', description: 'Documento firmado y archivado', color: 'border-[#13deb9]' },
] as const;

export function RecentActivity() {
    return (
        <CardBox className="h-full">
            <div>
                <h2 className="text-lg font-semibold">Actividad reciente</h2>
                <p className="text-muted-foreground text-sm font-normal">Últimos movimientos registrados</p>
            </div>

            <div className="mt-6">
                {timeline.map((item, index) => (
                    <div key={`${item.time}-${item.description}`} className="flex gap-x-3">
                        <div className="w-1/4 text-end">
                            <span className="text-foreground dark:text-muted-foreground text-sm font-medium">{item.time}</span>
                        </div>
                        <div
                            className={`after:bg-border relative after:absolute after:start-3.5 after:top-7 after:bottom-0 after:w-px after:-translate-x-1/2 ${index === timeline.length - 1 ? 'after:hidden' : ''}`}
                        >
                            <div className="relative z-1 flex size-7 items-center justify-center">
                                <div className={`size-3 rounded-full border-2 bg-transparent ${item.color}`} />
                            </div>
                        </div>
                        <div className="w-1/4 grow pt-0.5 pb-6">
                            <p className="text-foreground dark:text-muted-foreground font-medium">{item.description}</p>
                            {'reference' in item && <span className="text-[#5d87ff]">{item.reference}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </CardBox>
    );
}
