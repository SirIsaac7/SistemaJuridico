"use client";

import { motion } from "framer-motion";

import { AnimatedCounter } from "./animated-counter";
import { FadeUp } from "./fade-up";

const stats = [
  { value: 1250, suffix: "+", label: "Casos gestionados", description: "Civil, penal, laboral y más" },
  { value: 98, suffix: "%", label: "Clientes satisfechos", description: "Atención cercana y profesional" },
  { value: 25, suffix: "+", label: "Profesionales", description: "Abogados y consultores expertos" },
  { value: 15, suffix: "+", label: "Años de experiencia", description: "Trayectoria comprobada" },
  { value: 350, suffix: "+", label: "Consultas mensuales", description: "Presenciales y virtuales" },
  { value: 5000, suffix: "+", label: "Documentos protegidos", description: "Resguardo digital seguro" },
];

export function Stats() {
  return (
    <section className="lj-section relative overflow-hidden bg-[linear-gradient(180deg,#eef4ff_0%,#e0e9ff_50%,#eef4ff_100%)]">
      {/* Texto de fondo */}
      <div
        className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden"
        aria-hidden
      >
        <span className="lj-font-heading font-black text-[18vw] text-indigo-900/4 uppercase leading-none tracking-tighter">
          Resultados
        </span>
      </div>

      <div className="lj-container relative z-10">
        <div className="mb-10 text-center md:mb-16">
          <FadeUp>
            <span className="mb-4 block font-semibold text-indigo-600 text-xs uppercase tracking-[0.25em]">
              Cifras que respaldan
            </span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="lj-font-heading font-black text-3xl text-slate-900 uppercase sm:text-4xl md:text-5xl">
              Resultados
              <br />
              <span className="lj-gradient-indigo">que hablan por sí solos</span>
            </h2>
          </FadeUp>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="lj-glass lj-glass-sheen group relative rounded-3xl p-5 transition-shadow duration-300 hover:shadow-[0_32px_70px_-24px_rgba(30,41,99,0.45)] sm:p-8 md:p-10"
            >
              <div className="relative z-10">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  duration={2200}
                  className="lj-font-heading lj-gradient-indigo mb-2 block origin-left font-black text-4xl leading-none transition-transform duration-300 group-hover:scale-105 sm:text-5xl"
                />
                <p className="lj-font-heading mb-1 font-bold text-slate-900 text-sm uppercase tracking-wide sm:text-base">
                  {stat.label}
                </p>
                <p className="text-slate-500 text-xs">{stat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
