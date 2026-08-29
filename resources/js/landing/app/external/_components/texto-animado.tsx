"use client";

import { Fragment } from "react";

import { motion, useReducedMotion } from "framer-motion";

/** Paradas del degradado claro de los titulares sobre violeta. */
const PARADAS = ["#a5f3fc", "#bfdbfe", "#ffffff"] as const;

/** Interpola dos colores hexadecimales. */
function mezclar(a: string, b: string, t: number): string {
  const ha = Number.parseInt(a.slice(1), 16);
  const hb = Number.parseInt(b.slice(1), 16);
  const canal = (desplazamiento: number) => {
    const va = (ha >> desplazamiento) & 0xff;
    const vb = (hb >> desplazamiento) & 0xff;
    return Math.round(va + (vb - va) * t);
  };
  return `rgb(${canal(16)}, ${canal(8)}, ${canal(0)})`;
}

/**
 * Color del degradado en la posición `t` (de 0 a 1) de la línea.
 *
 * El titular se parte en letras para poder animarlas por separado, y eso
 * descarta `background-clip: text`: cada letra necesita mover su propio
 * `transform`, lo que rompe el recorte del fondo del elemento padre. Dando a
 * cada letra un color sólido tomado del mismo degradado, el conjunto se lee
 * igual que un degradado continuo y además admite transformaciones.
 */
function colorEnPosicion(t: number): string {
  const tramos = PARADAS.length - 1;
  const escalado = Math.min(Math.max(t, 0), 0.999) * tramos;
  const indice = Math.floor(escalado);
  return mezclar(PARADAS[indice], PARADAS[indice + 1], escalado - indice);
}

interface TextoAnimadoProps {
  texto: string;
  /** Segundos de espera antes de que arranque la primera letra. */
  retraso?: number;
  /** Colorea las letras siguiendo el degradado claro en lugar de heredar el color. */
  degradado?: boolean;
}

/**
 * Titular que se revela letra por letra, subiendo desde detrás de una máscara.
 *
 * Quien lo use debe envolverlo en un contenedor `block` con `overflow-hidden`:
 * ese recorte es el que oculta las letras mientras suben.
 */
export function TextoAnimado({ texto, retraso = 0, degradado = false }: TextoAnimadoProps) {
  const reducirMovimiento = useReducedMotion();

  if (reducirMovimiento) {
    return <span style={degradado ? { color: PARADAS[1] } : undefined}>{texto}</span>;
  }

  // Índice de arranque de cada palabra, para escalonar sin contar los espacios.
  let acumulado = 0;
  const palabras = texto.split(" ").map((palabra) => {
    const inicio = acumulado;
    acumulado += palabra.length;
    return { palabra, inicio };
  });
  const totalLetras = acumulado;

  return (
    <>
      {/* El texto partido en letras es decorativo: los lectores leen esta copia */}
      <span className="sr-only">{texto}</span>
      <span aria-hidden>
        {palabras.map(({ palabra, inicio }, p) => (
          <Fragment key={`${palabra}-${inicio}`}>
            {p > 0 ? " " : null}
            {/* La palabra no se parte al final de línea; las letras sí se animan sueltas */}
            <span className="inline-block whitespace-nowrap">
              {[...palabra].map((letra, i) => {
                const indice = inicio + i;
                const posicion = totalLetras > 1 ? indice / (totalLetras - 1) : 0;
                return (
                  <motion.span
                    key={`${letra}-${indice}`}
                    initial={{ y: "115%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    transition={{
                      duration: 0.8,
                      delay: retraso + indice * 0.03,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="inline-block"
                    style={degradado ? { color: colorEnPosicion(posicion) } : undefined}
                  >
                    {letra}
                  </motion.span>
                );
              })}
            </span>
          </Fragment>
        ))}
      </span>
    </>
  );
}
