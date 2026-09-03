import 'swiper/css';
import {
    BookOpen,
    BookOpenCheck,
    ChartNoAxesColumnIncreasing,
    ClipboardList,
    Files,
    KeyRound,
    LibraryBig,
    Search,
    ShieldCheck,
    UserCheck,
    Users,
    type LucideIcon,
} from 'lucide-react';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import type { DashboardCardData, DashboardTone } from '../types';
import { CardBox } from './card-box';

const toneStyles: Record<DashboardTone, { background: string; text: string }> = {
    blue: { background: 'bg-[#5d87ff]/10', text: 'text-[#5d87ff]' },
    cyan: { background: 'bg-[#49beff]/10', text: 'text-[#258ec8]' },
    green: { background: 'bg-[#13deb9]/10', text: 'text-[#0f9f86]' },
    violet: { background: 'bg-[#8754ec]/10', text: 'text-[#8754ec]' },
    amber: { background: 'bg-[#f6b51e]/10', text: 'text-[#b47a00]' },
    red: { background: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
    slate: { background: 'bg-[#7c8fac]/10', text: 'text-[#62728a]' },
};

const cardIcons: Record<string, LucideIcon> = {
    usuarios: Users,
    'usuarios-activos': UserCheck,
    roles: ShieldCheck,
    materias: LibraryBig,
    'mis-materias': BookOpen,
    catalogo: Search,
    archivos: Files,
    'mis-archivos': Files,
    solicitudes: ClipboardList,
    'solicitudes-recibidas': ClipboardList,
    'mis-solicitudes': ClipboardList,
    accesos: KeyRound,
    'mis-accesos': BookOpenCheck,
};

export function TopCards({ cards }: { cards: DashboardCardData[] }) {
    return (
        <Swiper
            slidesPerView={Math.min(cards.length, 6)}
            spaceBetween={24}
            loop={cards.length > 6}
            freeMode
            grabCursor
            speed={5000}
            autoplay={{ delay: 0, disableOnInteraction: false }}
            modules={[Autoplay]}
            breakpoints={{
                0: { slidesPerView: 1, spaceBetween: 10 },
                640: { slidesPerView: 2, spaceBetween: 14 },
                768: { slidesPerView: 3, spaceBetween: 18 },
                1030: { slidesPerView: 4, spaceBetween: 18 },
                1200: { slidesPerView: 6, spaceBetween: 24 },
            }}
            aria-label="Resumen de Normativa Virtual"
        >
            {cards.map((item) => {
                const style = toneStyles[item.tone];
                const Icon = cardIcons[item.key] ?? ChartNoAxesColumnIncreasing;

                return (
                    <SwiperSlide key={item.key} className="h-auto">
                        <CardBox className={`${style.background} h-full border-none shadow-none`}>
                            <div className="text-center transition-transform duration-200 ease-in-out hover:scale-105">
                                <div className="flex justify-center">
                                    <span
                                        className={`mb-3 flex size-[50px] items-center justify-center rounded-2xl bg-white/65 ${style.text} dark:bg-white/10`}
                                    >
                                        <Icon className="size-7" strokeWidth={1.8} aria-hidden="true" />
                                    </span>
                                </div>
                                <p className={`mb-1 font-semibold ${style.text}`}>{item.title}</p>
                                <p className={`text-lg font-semibold ${style.text}`}>{item.value.toLocaleString('es-BO')}</p>
                            </div>
                        </CardBox>
                    </SwiperSlide>
                );
            })}
        </Swiper>
    );
}
