import { Scale } from 'lucide-react';

export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-[#5d87ff]/10 text-[#5d87ff]">
                <Scale className="size-6" strokeWidth={1.8} />
            </div>
            <div className="grid flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
                <span className="text-foreground truncate text-base font-bold tracking-tight">Sistema Jurídico</span>
                <span className="text-muted-foreground truncate text-[11px] font-medium tracking-[0.16em] uppercase">Gestión legal</span>
            </div>
        </>
    );
}
