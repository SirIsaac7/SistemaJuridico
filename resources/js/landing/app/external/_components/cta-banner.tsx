"use client";

import Image from "@/landing/shims/next-image";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { TransicionAClaro } from "@/landing/components/ondas";

import { FadeUp } from "./fade-up";
import { WHATSAPP_LINK } from "./landing-config";
import { WhatsappIcon } from "./whatsapp-button";

export function CtaBanner() {
  return (
    // Arranca en el violeta con el que cierra la sección de contacto y vuelve a
    // disolverse en claro para dar paso a los artículos.
    <section className="relative overflow-hidden pt-20 pb-[260px] sm:pt-24 md:pt-32 md:pb-[370px]">
      {/* Cielo violeta + fotografía integrada por mezcla */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#2e1065_0%,#4c1d95_38%,#5b34d6_72%,#4f7bf0_100%)]" />
        <Image
          src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=85"
          alt=""
          fill
          className="object-cover object-center opacity-20 mix-blend-overlay"
          sizes="100vw"
        />
        {/* Halo turquesa que respira */}
        <div className="lj-breathe absolute -top-10 left-1/2 h-[460px] w-[820px] max-w-full -translate-x-1/2 bg-[radial-gradient(circle,rgba(94,234,212,0.22),transparent_68%)] blur-2xl" />
      </div>

      {/* Ondas que disuelven la banda hacia la sección clara siguiente */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <TransicionAClaro tamano="compacto" />
      </div>

      <div className="lj-container relative z-10 text-center">
        <FadeUp>
          <span className="mb-6 block font-semibold text-[#a5f3fc] text-xs uppercase tracking-[0.25em]">
            Agenda abierta este mes
          </span>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h2 className="lj-font-heading mx-auto mb-8 max-w-4xl font-black text-3xl text-white uppercase sm:text-4xl md:text-6xl">
            Su tranquilidad legal
            <br />
            <span className="lj-gradient-claro">comienza hoy.</span>
          </h2>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="mx-auto mb-10 max-w-md text-base text-white/70">
            Agende su primera evaluación sin costo y conozca cómo protegeremos sus intereses. Un equipo de abogados y
            asesores jurídicos está listo para atenderle.
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <motion.a
              href="#contacto"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-white py-2 pr-6 pl-2 font-semibold text-[15px] text-slate-900 shadow-[0_16px_38px_-12px_rgba(15,23,42,0.6)] transition-shadow duration-300 hover:shadow-[0_20px_50px_-12px_rgba(15,23,42,0.75)] sm:w-auto"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1_0%,#7c3aed_100%)] text-white">
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </span>
              Solicitar asesoría
            </motion.a>
            <motion.a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="lj-glass-oscuro inline-flex w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 font-semibold text-[15px] text-white transition-colors duration-200 hover:bg-white/20 sm:w-auto"
            >
              <WhatsappIcon size={18} />
              Contactar por WhatsApp
            </motion.a>
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
