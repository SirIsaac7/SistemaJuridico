"use client";

import Image from "@/landing/shims/next-image";

import { motion } from "framer-motion";
import { ArrowUpRight, Clock } from "lucide-react";

import { TransicionAOscuro } from "@/landing/components/ondas";

import { FadeUp } from "./fade-up";

const articles = [
  {
    image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800&q=85",
    category: "Contratos",
    readTime: "6 min de lectura",
    title: "Contratos claros: 5 cláusulas que nunca debe firmar sin leer",
    excerpt:
      "Las cláusulas de penalidad, rescisión y garantías esconden los mayores riesgos. Le explicamos cómo detectarlas antes de firmar.",
    date: "10 Jun 2026",
    author: "Dra. Valeria Rojas",
  },
  {
    image: "https://images.unsplash.com/photo-1436450412740-6b988f486c6b?w=800&q=85",
    category: "Laboral",
    readTime: "8 min de lectura",
    title: "Despido injustificado: sus derechos y los plazos para reclamar",
    excerpt:
      "Beneficios sociales, desahucio e indemnización: lo que todo trabajador debe saber antes de firmar su finiquito.",
    date: "28 May 2026",
    author: "Dr. Marco Antelo",
  },
  {
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=85",
    category: "Familia",
    readTime: "5 min de lectura",
    title: "Asistencia familiar: requisitos y procedimiento paso a paso",
    excerpt:
      "Una guía práctica para solicitar, modificar o hacer cumplir la asistencia familiar, con los documentos que necesitará.",
    date: "15 May 2026",
    author: "Dra. Carla Méndez",
  },
];

export function Blog() {
  return (
    // El relleno inferior extra deja libre la franja de ondas que desciende
    // hacia el violeta profundo del pie de página.
    <section className="relative overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#eef4ff_100%)] pt-16 pb-56 md:pt-24 md:pb-72 xl:pt-30">
      <div className="lj-container relative z-10">
        {/* Encabezado */}
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end">
          <div>
            <FadeUp>
              <span className="mb-4 block font-semibold text-indigo-600 text-xs uppercase tracking-[0.25em]">
                Recursos legales
              </span>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h2 className="lj-font-heading font-black text-3xl text-slate-900 uppercase sm:text-4xl md:text-5xl">
                Guías y artículos
                <br />
                <span className="lj-gradient-indigo">para decidir mejor</span>
              </h2>
            </FadeUp>
          </div>
          <FadeUp delay={0.2}>
            <motion.a
              href="#contacto"
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white/70 px-6 py-3 font-semibold text-indigo-700 text-sm backdrop-blur-sm transition-colors hover:bg-white"
            >
              Ver todos los artículos <ArrowUpRight size={14} />
            </motion.a>
          </FadeUp>
        </div>

        {/* Cuadrícula de artículos */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {articles.map((article, i) => (
            <motion.article
              key={article.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="lj-glass lj-glass-sheen group relative cursor-pointer overflow-hidden rounded-3xl p-5 transition-shadow duration-300 hover:shadow-[0_32px_70px_-24px_rgba(30,41,99,0.45)]"
            >
              <div className="relative z-10">
                {/* Imagen */}
                <div className="relative mb-5 h-52 overflow-hidden rounded-2xl">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(46,16,101,0.55)_100%)]" />
                  {/* Categoría */}
                  <div className="absolute top-4 left-4">
                    <span className="rounded-full bg-[linear-gradient(100deg,#4f46e5_0%,#7c3aed_100%)] px-3 py-1 font-black text-[10px] text-white uppercase tracking-widest">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Datos */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <Clock size={10} />
                    <span>{article.readTime}</span>
                  </div>
                  <span className="text-slate-300 text-xs">·</span>
                  <span className="text-slate-500 text-xs">{article.date}</span>
                </div>

                {/* Título */}
                <h3 className="lj-font-heading mb-3 font-black text-slate-900 text-xl uppercase leading-tight transition-colors duration-300 group-hover:text-indigo-600">
                  {article.title}
                </h3>

                <p className="mb-4 line-clamp-2 text-slate-600 text-sm leading-relaxed">{article.excerpt}</p>

                {/* Autor y flecha */}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-500 text-xs">{article.author}</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-300 text-slate-400 transition-all duration-300 group-hover:border-transparent group-hover:bg-[linear-gradient(135deg,#6366f1,#7c3aed)] group-hover:text-white">
                    <ArrowUpRight size={13} />
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>

      {/* Descenso al violeta profundo del pie de página */}
      <TransicionAOscuro />
    </section>
  );
}
