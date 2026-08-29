"use client";

import Image from "@/landing/shims/next-image";

import { Globe } from "lucide-react";

/**
 * Países cuya normativa cubre la plataforma, en el orden en que desfilan.
 * Las banderas son PNG locales (`public/assets/landing/banderas`) para que la
 * cinta no dependa de ningún servicio externo ni pueda quedarse en blanco.
 */
const PAISES = [
  { codigo: "ar", nombre: "Argentina" },
  { codigo: "bo", nombre: "Bolivia" },
  { codigo: "co", nombre: "Colombia" },
  { codigo: "cl", nombre: "Chile" },
  { codigo: "ec", nombre: "Ecuador" },
  { codigo: "mx", nombre: "México" },
  { codigo: "uy", nombre: "Uruguay" },
  { codigo: "py", nombre: "Paraguay" },
  { codigo: "pe", nombre: "Perú" },
] as const;

/*
  El desfile es una sola pista con tres copias idénticas de la lista que se
  desplaza -33.333% en bucle (ver `.lj-cinta` en landing.css): al terminar la
  vuelta, la segunda copia ocupa exactamente el lugar donde arrancó la primera
  y la costura es invisible. Son tres copias y no dos porque una sola copia
  (~1500px) debe poder cubrir el ancho visible en cualquier momento del
  recorrido, también en monitores muy anchos.

  El aire entre fichas va como padding de cada ficha, nunca como `gap`: con
  `gap` el hueco entre la última ficha de una copia y la primera de la
  siguiente sería distinto al interno y el salto se notaría en cada vuelta.
*/
const DESFILE = [0, 1, 2].flatMap((copia) =>
  PAISES.map((pais) => ({ ...pais, clave: `${pais.codigo}-${copia}`, decorativa: copia > 0 })),
);

/**
 * Cinta deslizante con las banderas de los países que cubre la plataforma.
 * Vive solo en la primera pantalla (Hero), justo encima de las ondas.
 */
export function CintaBanderas({ className = "" }: { className?: string }) {
  return (
    <section aria-label="Países con normativa disponible" className={`w-full ${className}`}>
      <div className="border-white/15 border-y bg-white/[0.07] backdrop-blur-md">
        <div className="lj-container flex items-center gap-5 py-3.5 md:py-4">
          {/* Rótulo fijo: da contexto a las banderas sin viajar con ellas */}
          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            <Globe size={15} className="text-[#a5f3fc]" />
            <span className="font-semibold text-[11px] text-white/65 uppercase tracking-[0.26em]">
              Normativa de 9 países
            </span>
            <span aria-hidden className="h-7 w-px bg-white/20" />
          </div>

          {/* Ventana del desfile: la máscara difumina las dos orillas */}
          <div className="lj-cinta-mascara relative min-w-0 flex-1 overflow-hidden">
            <ul className="lj-cinta flex w-max items-center">
              {DESFILE.map((pais) => (
                <li
                  key={pais.clave}
                  aria-hidden={pais.decorativa}
                  className="group flex shrink-0 items-center gap-3 px-5 sm:px-7"
                >
                  <span className="relative block h-9 w-[54px] shrink-0 overflow-hidden rounded-[5px] shadow-[0_8px_18px_-8px_rgba(2,6,23,0.9)] ring-1 ring-white/25 transition duration-300 ease-out group-hover:-translate-y-0.5 group-hover:shadow-[0_12px_24px_-8px_rgba(2,6,23,0.95)] group-hover:ring-white/70">
                    {/*
                      Carga inmediata a propósito: las nueve banderas pesan
                      ~31 KB en total y con carga diferida las copias que
                      entran desplazándose pueden asomar todavía en blanco.
                    */}
                    <Image
                      src={`/assets/landing/banderas/${pais.codigo}.png`}
                      alt=""
                      fill
                      sizes="54px"
                      loading="eager"
                      className="object-cover"
                    />
                    {/* Reflejo de vidrio sobre la bandera */}
                    <span
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.35)_0%,rgba(255,255,255,0)_45%)]"
                    />
                  </span>
                  <span className="whitespace-nowrap font-semibold text-[13px] text-white/70 uppercase tracking-[0.16em] transition-colors duration-300 group-hover:text-white">
                    {pais.nombre}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
