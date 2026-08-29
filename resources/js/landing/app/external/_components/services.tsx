"use client";

import { motion } from "framer-motion";
import { BarChart3, Briefcase, CalendarCheck, FileText, Scale, Users } from "lucide-react";

import { FadeUp } from "./fade-up";

const services = [
  {
    icon: Scale,
    title: "Consultoría Jurídica",
    description:
      "Asesoría legal personalizada para personas y empresas, con análisis del caso y estrategias claras desde la primera reunión.",
    tag: "Esencial",
  },
  {
    icon: Users,
    title: "Gestión de Clientes",
    description:
      "Registre y organice a sus clientes con historial completo: datos, casos asociados, documentos y comunicaciones en un solo lugar.",
    tag: "Clientes",
  },
  {
    icon: Briefcase,
    title: "Gestión de Casos",
    description:
      "Control total de expedientes, plazos procesales, audiencias y actuaciones. Nada se pierde, nada se vence sin aviso.",
    tag: "Destacado",
    highlight: true,
  },
  {
    icon: FileText,
    title: "Documentos Legales",
    description:
      "Elaboración, revisión y resguardo digital de contratos, memoriales y escritos, con control de acceso por usuarios y roles.",
    tag: "Documentos",
  },
  {
    icon: CalendarCheck,
    title: "Citas y Asesorías",
    description:
      "Agenda inteligente de citas y asesorías presenciales o virtuales, con recordatorios para usted y sus clientes.",
    tag: "Agenda",
  },
  {
    icon: BarChart3,
    title: "Reportes e Indicadores",
    description:
      "Reportes ejecutivos del estado de casos, carga de trabajo y resultados, para decidir con información y no con intuición.",
    tag: "Gerencial",
  },
];

export function Services() {
  return (
    <section id="servicios" className="lj-section relative overflow-hidden bg-[#eef4ff]">
      {/* Resplandores de acento */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 left-[10%] h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,0.12),transparent_70%)] blur-2xl" />
        <div className="absolute right-[5%] bottom-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(94,234,212,0.18),transparent_70%)] blur-2xl" />
      </div>

      <div className="lj-container relative">
        {/* Encabezado */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div>
            <FadeUp>
              <span className="mb-4 block font-semibold text-indigo-600 text-xs uppercase tracking-[0.25em]">
                Nuestros servicios
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="lj-font-heading font-black text-3xl text-slate-900 uppercase sm:text-4xl md:text-5xl">
                Soluciones legales
                <br />
                que <span className="lj-gradient-indigo">generan confianza</span>
              </h2>
            </FadeUp>
          </div>
          <FadeUp delay={0.2} className="max-w-xs">
            <p className="text-slate-600 text-sm leading-relaxed">
              Cada servicio está respaldado por nuestro sistema de gestión: información ordenada, segura y disponible
              cuando la necesita.
            </p>
          </FadeUp>
        </div>

        {/* Cuadrícula de tarjetas de vidrio */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -6 }}
                className={`lj-glass-sheen group relative cursor-default overflow-hidden rounded-3xl p-7 transition-shadow duration-300 ${
                  service.highlight
                    ? "border border-white/25 bg-[linear-gradient(135deg,#4f46e5_0%,#7c3aed_100%)] shadow-[0_28px_60px_-20px_rgba(79,70,229,0.65)]"
                    : "lj-glass hover:shadow-[0_32px_70px_-24px_rgba(30,41,99,0.45)]"
                }`}
              >
                <div className="relative z-10">
                  {/* Etiqueta */}
                  <span
                    className={`mb-6 inline-block rounded-full px-3 py-1 font-semibold text-[10px] uppercase tracking-widest ${
                      service.highlight ? "bg-white/20 text-white" : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {service.tag}
                  </span>

                  {/* Ícono */}
                  <div
                    className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
                      service.highlight
                        ? "bg-white/95"
                        : "bg-[linear-gradient(135deg,#6366f1_0%,#7c3aed_100%)] shadow-[0_10px_24px_-8px_rgba(79,70,229,0.75)]"
                    }`}
                  >
                    <Icon size={22} className={service.highlight ? "text-indigo-600" : "text-white"} />
                  </div>

                  <h3
                    className={`lj-font-heading mb-3 font-black text-xl uppercase tracking-tight transition-colors duration-300 ${
                      service.highlight ? "text-white" : "text-slate-900 group-hover:text-indigo-600"
                    }`}
                  >
                    {service.title}
                  </h3>

                  <p className={`text-sm leading-relaxed ${service.highlight ? "text-white/80" : "text-slate-600"}`}>
                    {service.description}
                  </p>

                  {/* Flecha */}
                  <div
                    className={`mt-6 flex items-center gap-1 opacity-0 transition-opacity duration-300 group-hover:opacity-100 ${
                      service.highlight ? "text-white" : "text-indigo-600"
                    }`}
                  >
                    <span className="font-semibold text-xs uppercase tracking-wider">Saber más</span>
                    <span className="text-xs">→</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
