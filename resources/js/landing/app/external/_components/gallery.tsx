"use client";

import Image from "@/landing/shims/next-image";

import { motion } from "framer-motion";

import { TransicionAOscuro } from "@/landing/components/ondas";

import { FadeUp } from "./fade-up";

const practiceAreas = [
  {
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=700&q=85",
    name: "Derecho Civil",
    result: "Contratos y obligaciones",
    tag: "Civil",
  },
  {
    image: "https://images.unsplash.com/photo-1589578527966-fdac0f44566c?w=700&q=85",
    name: "Derecho Penal",
    result: "Defensa especializada",
    tag: "Penal",
  },
  {
    image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=700&q=85",
    name: "Derecho Laboral",
    result: "Relaciones de trabajo",
    tag: "Laboral",
  },
  {
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=85",
    name: "Derecho Corporativo",
    result: "Empresas y sociedades",
    tag: "Corporativo",
  },
];

/** Velo inferior de cada foto: garantiza contraste del texto sobre la imagen. */
const VELO = "absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(46,16,101,0.88)_100%)]";
const ETIQUETA =
  "inline-block rounded-full bg-[linear-gradient(100deg,#4f46e5_0%,#7c3aed_100%)] font-black text-white uppercase tracking-widest";

export function Gallery() {
  return (
    // El relleno inferior extra deja libre la franja de ondas que desciende
    // hacia el violeta con el que arranca la sección de Planes.
    <section
      id="areas"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#eef4ff_0%,#f8fafc_60%,#eef4ff_100%)] pt-16 pb-56 md:pt-24 md:pb-72 xl:pt-30"
    >
      <div className="lj-container relative z-10">
        {/* Encabezado */}
        <div className="mb-10 text-center md:mb-16">
          <FadeUp>
            <span className="mb-4 block font-semibold text-indigo-600 text-xs uppercase tracking-[0.25em]">
              Áreas de práctica
            </span>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h2 className="lj-font-heading font-black text-3xl text-slate-900 uppercase sm:text-4xl md:text-5xl">
              Nuestras <span className="lj-gradient-indigo">especialidades</span>
              <br />
              legales
            </h2>
          </FadeUp>
        </div>

        {/* Cuadrícula tipo mosaico */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {/* Columna 1: alta */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0 }}
            className="group relative col-span-1 row-span-2 cursor-pointer"
          >
            <div className="relative h-[400px] overflow-hidden rounded-2xl shadow-[0_24px_55px_-22px_rgba(30,41,99,0.5)] sm:h-[500px]">
              <Image
                src={practiceAreas[0].image}
                alt={practiceAreas[0].name}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="25vw"
              />
              <div className={VELO} />
              <div className="absolute bottom-0 left-0 p-5">
                <span className={`${ETIQUETA} mb-2 px-3 py-1 text-[10px]`}>{practiceAreas[0].tag}</span>
                <p className="lj-font-heading font-black text-lg text-white leading-tight">{practiceAreas[0].name}</p>
                <p className="font-semibold text-[#a5f3fc] text-sm">{practiceAreas[0].result}</p>
              </div>
            </div>
          </motion.div>

          {/* Columna 2: dos bajas */}
          <div className="col-span-1 flex flex-col gap-4">
            {[practiceAreas[1], practiceAreas[2]].map((area, i) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 + i * 0.15 }}
                className="group relative cursor-pointer"
              >
                <div className="relative h-[192px] overflow-hidden rounded-2xl shadow-[0_24px_55px_-22px_rgba(30,41,99,0.5)] sm:h-[242px]">
                  <Image
                    src={area.image}
                    alt={area.name}
                    fill
                    className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    sizes="25vw"
                  />
                  <div className={VELO} />
                  <div className="absolute bottom-0 left-0 p-4">
                    <span className={`${ETIQUETA} mb-1.5 px-2 py-0.5 text-[9px]`}>{area.tag}</span>
                    <p className="lj-font-heading font-black text-sm text-white leading-tight">{area.name}</p>
                    <p className="font-semibold text-[#a5f3fc] text-xs">{area.result}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Columnas 3 y 4: panel ancho */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="group relative col-span-2 cursor-pointer"
          >
            <div className="relative h-[280px] overflow-hidden rounded-2xl shadow-[0_24px_55px_-22px_rgba(30,41,99,0.5)] sm:h-[400px] lg:h-[500px]">
              <Image
                src={practiceAreas[3].image}
                alt={practiceAreas[3].name}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="50vw"
              />
              <div className={VELO} />
              <div className="absolute bottom-0 left-0 p-4 sm:p-6">
                <span className={`${ETIQUETA} mb-2 px-3 py-1 text-[10px]`}>{practiceAreas[3].tag}</span>
                <p className="lj-font-heading font-black text-lg text-white leading-tight sm:text-2xl">
                  {practiceAreas[3].name}
                </p>
                <p className="font-semibold text-[#a5f3fc] text-sm sm:text-base">{practiceAreas[3].result}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Llamado a la acción */}
        <FadeUp delay={0.2} className="mt-12 text-center">
          <motion.a
            href="#contacto"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-7 py-3 font-semibold text-indigo-700 text-sm backdrop-blur-sm transition-colors duration-200 hover:bg-white"
          >
            Solicitar asesoría
            <span>→</span>
          </motion.a>
        </FadeUp>
      </div>

      {/* Descenso al violeta con el que arranca Planes */}
      <TransicionAOscuro />
    </section>
  );
}
