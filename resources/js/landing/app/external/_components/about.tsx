"use client";

import Image from "@/landing/shims/next-image";

import { motion } from "framer-motion";
import { Quote } from "lucide-react";

import { FadeUp, SlideIn } from "./fade-up";

const testimonials = [
  {
    name: "Dra. Valeria Rojas",
    role: "Abogada civilista",
    quote: "Con Normativa Virtual organizo expedientes y plazos en minutos. Mi estudio gana horas cada semana.",
  },
  {
    name: "Dr. Marco Antelo",
    role: "Consultor corporativo",
    quote: "El seguimiento de casos y los reportes son impecables. Mis clientes lo notan.",
  },
];

const featurePills = [
  "Gestión de casos jurídicos",
  "Documentos legales",
  "Citas y asesorías",
  "Seguridad de la información",
];

export function About() {
  return (
    <section id="nosotros" className="lj-section overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)]">
      <div className="lj-container">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Izquierda: imagen */}
          <SlideIn direction="left" className="lg:col-span-5">
            <div className="relative">
              <div className="relative h-[420px] overflow-hidden rounded-3xl shadow-[0_30px_70px_-25px_rgba(30,41,99,0.45)] sm:h-[540px] lg:h-[700px]">
                <Image
                  src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=85"
                  alt="Estatua de la justicia en despacho jurídico"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(46,16,101,0.55)_100%)]" />
              </div>
              {/* Recuadro flotante */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="absolute right-4 -bottom-6 rounded-2xl bg-[linear-gradient(135deg,#4f46e5_0%,#7c3aed_100%)] px-5 py-4 shadow-[0_18px_40px_-12px_rgba(79,70,229,0.7)] sm:px-6 sm:py-5 lg:-right-6"
              >
                <p className="lj-font-heading font-black text-4xl text-white leading-none">15+</p>
                <p className="mt-1 font-semibold text-white/75 text-xs uppercase tracking-widest">
                  Años de
                  <br />
                  trayectoria
                </p>
              </motion.div>
            </div>
          </SlideIn>

          {/* Derecha: contenido */}
          <div className="lg:col-span-7 lg:pl-8">
            <FadeUp delay={0.1}>
              <span className="mb-4 block font-semibold text-indigo-600 text-xs uppercase tracking-[0.25em]">
                Nuestra firma
              </span>
            </FadeUp>

            <FadeUp delay={0.2}>
              <h2 className="lj-font-heading mb-6 font-black text-4xl text-slate-900 uppercase leading-[0.95] tracking-tight sm:text-5xl md:text-6xl">
                Creado para
                <br />
                <span className="lj-gradient-indigo">proteger,</span>
                <br />
                no para complicar.
              </h2>
            </FadeUp>

            <FadeUp delay={0.3}>
              <p className="mb-4 max-w-lg text-base text-slate-600 leading-relaxed">
                Normativa Virtual nace de una convicción clara: un buen resultado legal exige orden, método y
                tecnología. Por eso unimos la experiencia de abogados y consultores con una plataforma que centraliza
                clientes, casos, documentos y citas en un solo lugar.
              </p>
              <p className="mb-10 max-w-lg text-base text-slate-600 leading-relaxed">
                Sin improvisaciones y sin papeles perdidos. Solo procesos claros, información protegida y un equipo
                comprometido con la defensa de sus intereses.
              </p>
            </FadeUp>

            {/* Distintivos */}
            <FadeUp delay={0.4}>
              <div className="mb-10 flex flex-wrap gap-3">
                {featurePills.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-indigo-200 bg-white/70 px-4 py-2 font-medium text-indigo-700 text-xs tracking-wide backdrop-blur-sm"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </FadeUp>

            {/* Mini testimonios */}
            <FadeUp delay={0.5}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {testimonials.map((t) => (
                  <div
                    key={t.name}
                    className="lj-glass lj-glass-sheen relative rounded-2xl p-5 transition-colors duration-300 hover:bg-white/80"
                  >
                    <div className="relative z-10">
                      <Quote size={18} className="mb-3 text-indigo-600" />
                      <p className="mb-3 text-slate-600 text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#7c3aed_100%)]">
                          <span className="font-bold text-white text-xs">{t.name.charAt(t.name.indexOf(".") + 2)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">{t.name}</p>
                          <p className="text-slate-500 text-xs">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </div>
    </section>
  );
}
