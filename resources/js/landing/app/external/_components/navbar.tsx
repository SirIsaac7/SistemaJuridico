"use client";

import { useEffect, useState } from "react";

import Image from "@/landing/shims/next-image";
import Link from "@/landing/shims/next-link";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Menu, X } from "lucide-react";

import { LOGIN_URL, whatsappMessageLink } from "./landing-config";
import { WhatsappIcon } from "./whatsapp-button";

const navLinks = [
  { label: "Inicio", href: "#inicio", id: "inicio" },
  { label: "Nosotros", href: "#nosotros", id: "nosotros" },
  { label: "Servicios", href: "#servicios", id: "servicios" },
  { label: "Planes", href: "#planes", id: "planes" },
  { label: "Contacto", href: "#contacto", id: "contacto" },
];

/**
 * Color del enlace: el activo siempre va en índigo; el resto depende de si la
 * barra ya está fijada en blanco o todavía flota sobre el violeta del Hero.
 */
function colorDeEnlace(activo: boolean, fijada: boolean): string {
  if (activo) return "text-indigo-600";
  return fijada ? "text-slate-600 hover:text-slate-900" : "text-white/75 hover:text-white";
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [active, setActive] = useState("inicio");
  const reducirMovimiento = useReducedMotion();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Resalta el enlace de la sección visible (scroll spy defensivo: solo observa lo que existe)
  useEffect(() => {
    const sections = navLinks.map((link) => document.getElementById(link.id)).filter((el): el is HTMLElement => !!el);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Con el menú abierto: bloquea el scroll del fondo, cierra con Escape
  // y se descarta solo si el viewport pasa a escritorio.
  useEffect(() => {
    if (!mobileOpen) return;

    const overflowPrevio = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    // Debe coincidir con el `lg:` que muestra la barra de escritorio: si el
    // menú siguiera abierto al pasar a escritorio taparía la página entera.
    const escritorio = window.matchMedia("(min-width: 1024px)");
    const onEscritorio = () => {
      if (escritorio.matches) setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    escritorio.addEventListener("change", onEscritorio);
    return () => {
      document.body.style.overflow = overflowPrevio;
      window.removeEventListener("keydown", onKeyDown);
      escritorio.removeEventListener("change", onEscritorio);
    };
  }, [mobileOpen]);

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
          scrolled
            ? "border-slate-900/10 border-b bg-white/80 shadow-[0_8px_30px_rgba(30,41,99,0.10)] backdrop-blur-xl"
            : "border-transparent border-b bg-transparent"
        }`}
      >
        <div className="lj-container">
          <div className="flex h-20 items-center justify-between">
            {/*
              Logotipo: sobre el Hero violeta va la versión original (texto
              blanco); al fijarse la barra en blanco cambia a la variante clara,
              porque el blanco puro desaparecería.
            */}
            <Link href="/" className="group flex shrink-0 items-center gap-2">
              <Image
                width={262}
                height={72}
                className="h-9 w-auto transition-transform duration-300 group-hover:scale-105"
                src={scrolled ? "/assets/landing/logo-claro.svg" : "/assets/landing/logo.svg"}
                alt="Normativa Virtual"
                priority
              />
            </Link>

            {/*
              Navegación de escritorio. Aparece a partir de `lg` y no de `md`:
              el contenedor reserva 4rem de margen a cada lado, así que por
              debajo de 1024px el logo, los cinco enlaces y el botón se
              disputaban el mismo ancho y el botón acababa partido en tres
              líneas. Hasta ahí manda el menú desplegable.
              Los enlaces van justos de sangría y cuerpo hasta `xl`, donde ya
              sobra sitio para el tamaño de siempre.
            */}
            <ul className="hidden items-center gap-0.5 lg:flex xl:gap-1">
              {navLinks.map((link) => {
                const isActive = active === link.id;
                const colorEnlace = colorDeEnlace(isActive, scrolled);
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className={`group relative block whitespace-nowrap px-3 py-2 font-medium text-[13px] uppercase tracking-wide transition-colors duration-300 xl:px-4 xl:text-sm ${colorEnlace}`}
                    >
                      {link.label}
                      {/* Subrayado índigo animado. El ancho se descuenta con la
                          misma sangría que el enlace en cada tamaño. */}
                      <span
                        className={`absolute bottom-0.5 left-3 h-px bg-[linear-gradient(90deg,#4f46e5,#7c3aed)] transition-all duration-300 ease-out xl:left-4 ${
                          isActive
                            ? "w-[calc(100%-1.5rem)] opacity-100 xl:w-[calc(100%-2rem)]"
                            : "w-0 opacity-0 group-hover:w-[calc(100%-1.5rem)] group-hover:opacity-100 xl:group-hover:w-[calc(100%-2rem)]"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Acción principal */}
            <div className="hidden shrink-0 items-center gap-4 lg:flex">
              <motion.a
                href={LOGIN_URL}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className={`lj-btn-shine group relative flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-full px-5 py-2.5 font-semibold text-[13px] transition-shadow duration-300 xl:px-6 xl:text-sm ${
                  scrolled
                    ? "bg-[linear-gradient(100deg,#4f46e5_0%,#7c3aed_100%)] text-white shadow-[0_10px_26px_-10px_rgba(79,70,229,0.8)] hover:shadow-[0_14px_34px_-10px_rgba(79,70,229,0.95)]"
                    : "bg-white text-slate-900 shadow-[0_10px_26px_-10px_rgba(15,23,42,0.6)] hover:shadow-[0_14px_34px_-10px_rgba(15,23,42,0.75)]"
                }`}
              >
                {/* La etiqueta se acorta donde el ancho aprieta: hasta `xl` dice
                    solo «Ingresar», que se entiende igual junto a la flecha. */}
                <span className="relative z-10 xl:hidden">Ingresar</span>
                <span className="relative z-10 hidden xl:inline">Ingresar al sistema</span>
                <ArrowRight
                  size={16}
                  className="relative z-10 shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                />
              </motion.a>
            </div>

            {/* Botón de menú desplegable (móvil y tablet) */}
            <button
              type="button"
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full border backdrop-blur-sm transition-colors duration-200 lg:hidden ${
                scrolled
                  ? "border-slate-900/10 bg-white/70 text-slate-700 hover:text-indigo-600"
                  : "border-white/25 bg-white/10 text-white hover:bg-white/20"
              }`}
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú de navegación"
              aria-expanded={mobileOpen}
              aria-controls="lj-menu-movil"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Menú móvil a pantalla completa */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="lj-menu-movil"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            initial={reducirMovimiento ? { opacity: 0 } : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducirMovimiento ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed inset-0 z-[70] overflow-y-auto bg-[#2e1065] lg:hidden"
          >
            {/*
              Fondo: degradado violeta y dos resplandores.
              Aquí había además una marca de agua «JURÍDICO» a 9rem que en un
              teléfono no entraba a lo ancho: se leía cortada («RIDICO») y se
              encabalgaba sobre los botones y el pie. La profundidad la dan los
              resplandores, que no compiten con ningún texto.
            */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(180deg,#2e1065_0%,#4c1d95_45%,#4338ca_100%)]" />
              <div className="absolute -top-24 -right-20 h-72 w-72 rounded-full bg-[#5eead4]/20 blur-[110px]" />
              <div className="absolute bottom-24 -left-24 h-64 w-64 rounded-full bg-[#7c3aed]/30 blur-[100px]" />
            </div>

            <div className="relative flex min-h-full flex-col">
              {/* Cabecera del menú: mismo alto que la barra para una transición perfecta */}
              <motion.div
                initial={reducirMovimiento ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="lj-container w-full"
              >
                <div className="flex h-20 items-center justify-between">
                  <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
                    <Image
                      width={262}
                      height={72}
                      className="h-9 w-auto"
                      src="/assets/landing/logo.svg"
                      alt="Normativa Virtual"
                    />
                  </Link>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors duration-200 hover:bg-white/20"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Cerrar menú"
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>

              {/* Enlaces editoriales numerados */}
              {/* La lista arranca bajo la cabecera y los botones quedan abajo:
                  centrarla dejaba dos huecos grandes en teléfonos altos. */}
              <nav className="lj-container flex w-full flex-1 flex-col justify-start pt-2 pb-6">
                <motion.p
                  initial={reducirMovimiento ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className="mb-2.5 font-semibold text-[10px] text-white/45 uppercase tracking-[0.3em]"
                >
                  Navegación
                </motion.p>
                <ul className="border-white/10 border-t">
                  {navLinks.map((link, i) => {
                    const isActive = active === link.id;
                    return (
                      <motion.li
                        key={link.label}
                        initial={reducirMovimiento ? false : { opacity: 0, y: 22 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.12 + i * 0.055, ease: [0.16, 1, 0.3, 1] }}
                        className="border-white/10 border-b"
                      >
                        {/* py-3.5 + 18px de texto ≈ 52px de alto: por encima del
                            mínimo táctil recomendado sin estirar la lista. */}
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          aria-current={isActive ? "true" : undefined}
                          className="group flex items-center justify-between gap-4 py-3.5 active:bg-white/5"
                        >
                          <span className="flex items-baseline gap-3.5">
                            <span
                              className={`font-semibold text-[10px] tabular-nums tracking-[0.18em] ${
                                isActive ? "text-[#a5f3fc]" : "text-white/35"
                              }`}
                            >
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <span
                              className={`lj-font-heading font-bold text-[1.125rem] uppercase leading-snug tracking-[0.06em] transition-colors duration-200 ${
                                isActive ? "text-[#a5f3fc]" : "text-white group-active:text-[#a5f3fc]"
                              }`}
                            >
                              {link.label}
                            </span>
                          </span>
                          <ArrowRight
                            size={16}
                            className={`shrink-0 transition-transform duration-200 group-active:translate-x-1 ${
                              isActive ? "text-[#a5f3fc]" : "text-white/30"
                            }`}
                          />
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
              </nav>

              {/* Acciones y cierre del menú (con espacio para el gesto de inicio del iPhone) */}
              <motion.div
                initial={reducirMovimiento ? false : { opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
                className="lj-container w-full pb-[max(1.75rem,env(safe-area-inset-bottom))]"
              >
                <div className="mb-5 h-px w-full bg-[linear-gradient(90deg,rgba(165,243,252,0.5),rgba(255,255,255,0.1),transparent)]" />
                <a
                  href={LOGIN_URL}
                  onClick={() => setMobileOpen(false)}
                  className="lj-btn-shine relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-white py-3.5 font-semibold text-[15px] text-slate-900 shadow-[0_14px_34px_-10px_rgba(15,23,42,0.6)]"
                >
                  Ingresar al sistema
                  <ArrowRight size={16} />
                </a>
                <a
                  href={whatsappMessageLink("Hola, deseo solicitar una asesoría jurídica.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 font-semibold text-[14px] text-white/85 transition-colors duration-200 hover:border-[#25d366]/60 hover:text-[#25d366]"
                >
                  <WhatsappIcon size={16} />
                  Escribir por WhatsApp
                </a>
                <p className="mt-5 text-center font-medium text-[10px] text-white/40 uppercase tracking-[0.28em]">
                  Excelencia jurídica a su servicio
                </p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
