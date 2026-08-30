'use client';

import Image from '@/landing/shims/next-image';
import Link from '@/landing/shims/next-link';
import { showNotification } from '@/lib/sweet-alert';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

import { LOGIN_URL, WHATSAPP_LINK } from './landing-config';

// Íconos sociales propios (lucide-react ya no incluye íconos de marcas)
function IconInstagram() {
    return (
        <svg
            viewBox="0 0 24 24"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
        </svg>
    );
}
function IconX() {
    return (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.632L18.244 2.25Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
        </svg>
    );
}
function IconYoutube() {
    return (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    );
}
function IconFacebook() {
    return (
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor" aria-hidden="true">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
    );
}

const footerLinks: Record<string, { label: string; href: string; external?: boolean }[]> = {
    'La firma': [
        { label: 'Nosotros', href: '#nosotros' },
        { label: 'Servicios', href: '#servicios' },
        { label: 'Áreas de práctica', href: '#areas' },
        { label: 'Planes', href: '#planes' },
        { label: 'Testimonios', href: '#testimonios' },
    ],
    Servicios: [
        { label: 'Consultoría jurídica', href: '#servicios' },
        { label: 'Gestión de clientes', href: '#servicios' },
        { label: 'Gestión de casos', href: '#servicios' },
        { label: 'Documentos legales', href: '#servicios' },
        { label: 'Citas y asesorías', href: '#servicios' },
    ],
    Soporte: [
        { label: 'Preguntas frecuentes', href: '#contacto' },
        { label: 'Solicitar asesoría', href: '#contacto' },
        { label: 'Contactar por WhatsApp', href: WHATSAPP_LINK, external: true },
        { label: 'Ingresar al sistema', href: LOGIN_URL },
        { label: 'Política de privacidad', href: '#' },
    ],
};

const socials = [
    { icon: IconInstagram, label: 'Instagram', href: '#' },
    { icon: IconX, label: 'Twitter/X', href: '#' },
    { icon: IconYoutube, label: 'YouTube', href: '#' },
    { icon: IconFacebook, label: 'Facebook', href: '#' },
];

export function Footer() {
    return (
        <footer className="relative overflow-hidden bg-[linear-gradient(180deg,#2e1065_0%,#241056_55%,#1e1b4b_100%)] pt-16 pb-10 sm:pt-20">
            {/* Texto gigante de fondo y resplandores */}
            <div
                className="pointer-events-none absolute right-0 bottom-0 left-0 flex items-end justify-center overflow-hidden select-none"
                aria-hidden
            >
                <span className="lj-font-heading translate-y-6 text-[22vw] leading-none font-black tracking-tighter text-white/4 uppercase">
                    Normativa
                </span>
            </div>
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 right-[12%] h-72 w-72 rounded-full bg-[#5eead4]/12 blur-[110px]" />
                <div className="absolute bottom-0 -left-20 h-64 w-64 rounded-full bg-[#7c3aed]/25 blur-[100px]" />
            </div>

            <div className="lj-container relative z-10">
                {/* Fila superior */}
                <div className="mb-14 grid grid-cols-1 gap-12 lg:mb-20 lg:grid-cols-12 lg:gap-16">
                    {/* Columna de marca */}
                    <div className="lg:col-span-4">
                        {/* Logotipo */}
                        <Link href="/" className="mb-6 flex items-center gap-2">
                            <Image width={262} height={72} className="h-9 w-auto" src="/assets/landing/logo.svg" alt="Normativa Virtual" />
                        </Link>
                        <p className="mb-8 max-w-xs text-sm leading-relaxed text-white/65">
                            Empresa internacional de normativa actualizada para el ámbito empresarial y gubernamental, con cobertura en nueve países
                            de Iberoamérica.
                        </p>

                        {/* Boletín */}
                        <div>
                            <p className="mb-3 text-xs font-semibold tracking-widest text-white uppercase">Reciba novedades legales</p>
                            <div className="flex">
                                <input
                                    type="email"
                                    placeholder="su@correo.com"
                                    className="flex-1 rounded-l-full border border-r-0 border-white/15 bg-white/10 px-5 py-3 text-sm text-white backdrop-blur-sm placeholder:text-white/45 focus:border-[#a5f3fc]/60 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    aria-label="Suscribirse al boletín"
                                    onClick={() => showNotification('success', 'Gracias por suscribirse. Pronto recibirá nuestras novedades.')}
                                    className="rounded-r-full bg-[linear-gradient(100deg,#6366f1_0%,#7c3aed_100%)] px-5 py-3 text-sm font-bold text-white transition-shadow hover:shadow-[0_10px_26px_-8px_rgba(124,58,237,0.9)]"
                                >
                                    <ArrowUpRight size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Columnas de enlaces */}
                    <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category}>
                                <h4 className="lj-font-heading mb-5 text-xs font-black tracking-widest text-white uppercase">{category}</h4>
                                <ul className="space-y-3">
                                    {links.map((link) => (
                                        <li key={link.label}>
                                            {link.external ? (
                                                <a
                                                    href={link.href}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-white/65 transition-colors duration-200 hover:text-[#a5f3fc]"
                                                >
                                                    {link.label}
                                                </a>
                                            ) : (
                                                <Link
                                                    href={link.href}
                                                    className="text-sm text-white/65 transition-colors duration-200 hover:text-[#a5f3fc]"
                                                >
                                                    {link.label}
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Fila inferior */}
                <div className="flex flex-col items-center justify-between gap-6 border-t border-white/10 pt-8 md:flex-row">
                    <p className="text-xs text-white/50">© {new Date().getFullYear()} Normativa Virtual. Todos los derechos reservados.</p>

                    {/* Redes sociales */}
                    <div className="flex items-center gap-3">
                        {socials.map((social) => {
                            const Icon = social.icon;
                            return (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    aria-label={social.label}
                                    whileHover={{ scale: 1.15, y: -2 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/65 transition-all duration-200 hover:border-[#a5f3fc]/60 hover:text-[#a5f3fc]"
                                >
                                    <Icon />
                                </motion.a>
                            );
                        })}
                    </div>

                    <p className="text-xs text-white/50">Privacidad · Términos · Cookies</p>
                </div>
            </div>
        </footer>
    );
}
