"use client";

import type { CSSProperties } from "react";

import Image from "@/landing/shims/next-image";

import { motion } from "framer-motion";
import { ArrowRight, Globe } from "lucide-react";

import { TransicionAClaro } from "@/landing/components/ondas";

import { CintaBanderas } from "./cinta-banderas";
import { LOGIN_URL } from "./landing-config";

/*
  Partículas decorativas con posiciones fijas (nada aleatorio: el servidor y el
  cliente deben renderizar exactamente lo mismo para no romper la hidratación).
*/
const GLIFOS = [
  { glifo: "§", top: "16%", left: "56%", tamano: "2.4rem", duracion: "17s", retraso: "0s" },
  { glifo: "¶", top: "62%", left: "86%", tamano: "1.9rem", duracion: "21s", retraso: "-7s" },
  { glifo: "§", top: "30%", left: "90%", tamano: "1.5rem", duracion: "15s", retraso: "-11s" },
  { glifo: "Art.", top: "78%", left: "58%", tamano: "1.1rem", duracion: "19s", retraso: "-4s" },
];

const DESTELLOS = [
  { top: "22%", left: "48%", tamano: 5, duracion: "5s", retraso: "0s" },
  { top: "40%", left: "72%", tamano: 4, duracion: "6.5s", retraso: "-2s" },
  { top: "14%", left: "80%", tamano: 6, duracion: "7s", retraso: "-4.5s" },
  { top: "70%", left: "44%", tamano: 4, duracion: "5.5s", retraso: "-1.2s" },
  { top: "55%", left: "63%", tamano: 5, duracion: "8s", retraso: "-3.4s" },
];

export function Hero() {
  return (
    /*
      La primera pantalla se ordena en columna: contenido centrado y, pegada
      abajo, la cinta de banderas. El relleno inferior de la sección deja libre
      la altura de la pila de ondas (220/320px) para que nada quede sobre ellas.
    */
    <section
      id="inicio"
      className="relative flex min-h-svh flex-col justify-center overflow-hidden pt-24 pb-[240px] md:pb-[336px]"
    >
      {/* Cielo violeta + fotografía integrada por mezcla */}
      <div aria-hidden className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#2e1065_0%,#4c1d95_30%,#5b34d6_60%,#4f7bf0_100%)]" />
        <Image
          src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?w=1920&q=90"
          alt=""
          fill
          priority
          className="object-cover object-center opacity-25 mix-blend-overlay"
          sizes="100vw"
        />
        {/* Viñeta lateral para que el texto siempre tenga fondo sólido */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(46,16,101,0.85)_0%,rgba(46,16,101,0.35)_45%,transparent_100%)]" />
        {/* Halo turquesa que respira */}
        <div className="lj-breathe absolute top-1/4 right-[8%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.22),transparent_68%)] blur-2xl" />
      </div>

      {/* Partículas jurídicas: glifos, documentos abstractos y destellos */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden sm:block">
        {GLIFOS.map((g) => (
          <span
            key={`${g.glifo}-${g.top}`}
            className="lj-hero-flotante lj-font-heading absolute text-white/10"
            style={
              {
                top: g.top,
                left: g.left,
                fontSize: g.tamano,
                "--lj-dur": g.duracion,
                "--lj-retraso": g.retraso,
              } as CSSProperties
            }
          >
            {g.glifo}
          </span>
        ))}

        {/* Documentos abstractos casi transparentes */}
        <div
          className="lj-hero-flotante absolute top-[20%] right-[14%] h-32 w-24 rotate-12 rounded-lg border border-white/10 p-3"
          style={{ "--lj-dur": "23s", "--lj-retraso": "-9s" } as CSSProperties}
        >
          <div className="mb-2 h-1 w-2/3 rounded bg-white/10" />
          <div className="mb-2 h-px w-full bg-white/10" />
          <div className="mb-2 h-px w-5/6 bg-white/10" />
          <div className="h-px w-4/6 bg-white/10" />
        </div>
        <div
          className="lj-hero-flotante absolute right-[30%] bottom-[30%] hidden h-24 w-20 -rotate-6 rounded-lg border border-white/10 p-2.5 lg:block"
          style={{ "--lj-dur": "26s", "--lj-retraso": "-15s" } as CSSProperties}
        >
          <div className="mb-1.5 h-1 w-1/2 rounded bg-white/10" />
          <div className="mb-1.5 h-px w-full bg-white/10" />
          <div className="h-px w-3/4 bg-white/10" />
        </div>

        {DESTELLOS.map((d) => (
          <span
            key={`${d.top}-${d.left}`}
            className="lj-destello absolute rounded-full bg-white"
            style={
              {
                top: d.top,
                left: d.left,
                width: d.tamano,
                height: d.tamano,
                "--lj-dur": d.duracion,
                "--lj-retraso": d.retraso,
              } as CSSProperties
            }
          />
        ))}
      </div>

      {/* Ondas que disuelven la banda hacia la sección clara siguiente */}
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <TransicionAClaro tamano="compacto" />
      </div>

      <div className="lj-container relative z-10 w-full">
        {/* Etiqueta: lo primero que se lee es que la empresa es internacional */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lj-glass-oscuro mb-6 inline-flex items-center gap-2.5 rounded-full px-4 py-2"
        >
          <Globe size={14} className="text-[#a5f3fc]" />
          <span className="font-medium text-white/85 text-xs uppercase tracking-widest">
            Empresa internacional
            {/* En pantallas estrechas la etiqueta se queda en una sola línea */}
            <span className="hidden sm:inline"> · Normativa actualizada</span>
          </span>
        </motion.div>

        {/* Nombre de la empresa: el bloque más grande de la pantalla */}
        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="lj-font-heading relative font-black text-5xl leading-[0.95] tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        >
          {/* Halo detrás del nombre para despegarlo de la fotografía */}
          <span
            aria-hidden
            className="lj-breathe absolute -inset-x-10 -inset-y-12 bg-[radial-gradient(ellipse_at_30%_50%,rgba(94,234,212,0.22),transparent_70%)] blur-3xl"
          />
          <span className="relative inline-block bg-[linear-gradient(100deg,#ffffff_0%,#e0e7ff_55%,#c7d2fe_100%)] bg-clip-text pb-[0.06em] text-transparent">
            Normativa
          </span>
          <span className="relative inline-block bg-[linear-gradient(100deg,#5eead4_0%,#a5f3fc_55%,#ffffff_100%)] bg-clip-text pb-[0.06em] text-transparent">
            Virtual
          </span>
        </motion.h1>

        {/* Texto de apoyo y acciones */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65 }}
          className="mt-7 flex flex-col gap-7"
        >
          <p className="max-w-xl text-base text-white/80 leading-relaxed">
            Empresa internacional que reúne, ordena y mantiene al día la normativa vigente aplicable al{" "}
            <strong className="font-semibold text-white">ámbito empresarial y gubernamental</strong>, con cobertura en
            nueve países de Iberoamérica.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <motion.a
              href={LOGIN_URL}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="lj-btn-shine group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-white py-2 pr-6 pl-2 font-semibold text-[14px] text-slate-900 uppercase tracking-[0.08em] shadow-[0_14px_34px_-10px_rgba(15,23,42,0.55)] transition-shadow duration-300 hover:shadow-[0_18px_44px_-10px_rgba(15,23,42,0.7)] sm:w-auto"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#7c3aed_100%)] text-white">
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
              Explorar normativa
            </motion.a>
            <motion.a
              href="#servicios"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="lj-glass-oscuro flex w-full items-center justify-center rounded-full px-7 py-3.5 font-semibold text-[15px] text-white transition-colors duration-200 hover:bg-white/20 sm:w-auto"
            >
              Ver servicios
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Cinta de banderas: cierra la primera pantalla justo encima de las ondas */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 mt-12 md:mt-16"
      >
        <CintaBanderas />
      </motion.div>
    </section>
  );
}
