"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Barra de progreso de lectura fija en la parte superior.
 * Usa un resorte (spring) para que avance con un empuje suave y elástico,
 * con degradado índigo y resplandor acordes a la paleta de la landing.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    mass: 0.6,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed top-0 right-0 left-0 z-[60] h-[3px] origin-left bg-linear-to-r from-[#4f46e5] via-[#7c3aed] to-[#5eead4] shadow-[0_0_12px_rgba(124,58,237,0.6),0_0_4px_rgba(94,234,212,0.8)]"
    >
      {/* Punta luminosa que "empuja" la barra */}
      <div className="absolute top-1/2 right-0 h-[7px] w-[7px] translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5eead4] shadow-[0_0_10px_3px_rgba(94,234,212,0.85)]" />
    </motion.div>
  );
}
