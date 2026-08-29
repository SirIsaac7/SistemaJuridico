import 'swiper/css';
import { Autoplay } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/react';

import iconBriefcase from '../assets/icon-briefcase.svg';
import iconConnect from '../assets/icon-connect.svg';
import iconFavorites from '../assets/icon-favorites.svg';
import iconMailbox from '../assets/icon-mailbox.svg';
import iconSpeechBubble from '../assets/icon-speech-bubble.svg';
import iconUser from '../assets/icon-user-male.svg';
import { CardBox } from './card-box';

const summaryCards = [
    { title: 'Expedientes', value: '124+', image: iconConnect, background: 'bg-[#8754ec]/10', text: 'text-[#8754ec]' },
    { title: 'Clientes', value: '96', image: iconUser, background: 'bg-[#13deb9]/10', text: 'text-[#0f9f86]' },
    { title: 'Audiencias', value: '10+', image: iconSpeechBubble, background: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
    { title: 'Notificaciones', value: '8+', image: iconMailbox, background: 'bg-[#49beff]/10', text: 'text-[#258ec8]' },
    { title: 'Causas activas', value: '78', image: iconBriefcase, background: 'bg-[#f6b51e]/10', text: 'text-[#b47a00]' },
    { title: 'Abogados', value: '24', image: iconUser, background: 'bg-[#5d87ff]/10', text: 'text-[#5d87ff]' },
    { title: 'Documentos', value: '696', image: iconFavorites, background: 'bg-[#ef4444]/10', text: 'text-[#ef4444]' },
] as const;

export function TopCards() {
    return (
        <Swiper
            slidesPerView={6}
            spaceBetween={24}
            loop
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
            aria-label="Resumen del Sistema Jurídico"
        >
            {summaryCards.map((item) => (
                <SwiperSlide key={item.title} className="h-auto">
                    <CardBox className={`${item.background} h-full border-none shadow-none`}>
                        <div className="text-center transition-transform duration-200 ease-in-out hover:scale-105">
                            <div className="flex justify-center">
                                <img src={item.image} width={50} height={50} className="mb-3" alt="" aria-hidden="true" />
                            </div>
                            <p className={`mb-1 font-semibold ${item.text}`}>{item.title}</p>
                            <p className={`text-lg font-semibold ${item.text}`}>{item.value}</p>
                        </div>
                    </CardBox>
                </SwiperSlide>
            ))}
        </Swiper>
    );
}
