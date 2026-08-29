"use client";

import type * as React from "react";

import { cn } from "@/landing/lib/utils";

/**
 * Texto con una aurora de color que se desplaza por dentro de las letras.
 *
 * El degradado se recorta a la silueta del texto con `background-clip: text` y
 * se anima moviendo `background-position`. Solo se anima esa propiedad, así que
 * el navegador no recalcula diseño en cada fotograma.
 *
 * Importante para quien lo use: `background-clip: text` pinta el fondo del
 * propio elemento. Si a los hijos se les aplica un `transform`, el recorte deja
 * de seguirlos y el texto sale transparente. Por eso este componente recibe el
 * texto como cadena y no como nodos: cualquier animación de entrada debe ir en
 * un contenedor por fuera.
 */

/** Paletas listas, alineadas con la landing pública. */
export const PALETAS_AURORA = {
  /** Turquesa → celeste → blanco → lavanda. Para fondos violetas. */
  claro: ["#a5f3fc", "#bfdbfe", "#ffffff", "#c4b5fd", "#a5f3fc"],
  /** Índigo → violeta → azul. Para fondos claros. */
  indigo: ["#4f46e5", "#7c3aed", "#2563eb", "#6366f1", "#4f46e5"],
} as const;

export interface AuroraTextEffectProps {
  /** El texto a pintar. Va como cadena, no como nodos (ver nota arriba). */
  text: string;
  /** Colores de la aurora. Se repite el primero al final para un bucle continuo. */
  colors?: readonly string[];
  /** Segundos que tarda un ciclo completo. */
  speed?: number;
  /** Etiqueta a renderizar. Por defecto `span`. */
  as?: "span" | "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
}

export function AuroraTextEffect({
  text,
  colors = PALETAS_AURORA.claro,
  speed = 8,
  as: Etiqueta = "span",
  className,
}: AuroraTextEffectProps) {
  // El ángulo de 110° hace que la aurora cruce en diagonal y no en horizontal,
  // que se lee más natural sobre varias líneas.
  const degradado = `linear-gradient(110deg, ${colors.join(", ")})`;

  return (
    <Etiqueta
      className={cn("cj-aurora-text", className)}
      style={
        {
          backgroundImage: degradado,
          animationDuration: `${speed}s`,
        } as React.CSSProperties
      }
    >
      {text}
    </Etiqueta>
  );
}
