/**
 * Ondas decorativas del fondo violeta.
 *
 * Se dibujan con SVG inline (sin imágenes externas) y se desplazan en bucle a
 * distintas velocidades. Las usan las bandas violetas de la landing —Hero,
 * Planes, CTA— y también las pantallas de acceso, para que el sistema y la web
 * pública se sientan del mismo mundo.
 *
 * La animación (`.onda`) vive en `globals.css` justamente porque el componente
 * ya no es exclusivo de la landing.
 */

const ONDA_ANCHO = 2880;
const ONDA_ALTO = 320;

/**
 * Traza una onda senoidal aproximada con curvas cúbicas y la cierra hacia abajo
 * para poder rellenarla.
 *
 * El patrón se repite 4 veces sobre un lienzo del doble del ancho visible, de
 * modo que la capa puede desplazarse un -50% en bucle sin que se note la
 * costura (ver `.onda` en globals.css).
 */
export function ondaPath(base: number, amplitud: number): string {
  const medioPeriodo = 360;
  const c1 = 120;
  const c2 = 240;
  const tirar = (4 * amplitud) / 3;

  let d = `M 0 ${base}`;
  for (let i = 0; i < 4; i++) {
    d += ` c ${c1} ${-tirar}, ${c2} ${-tirar}, ${medioPeriodo} 0`;
    d += ` c ${c1} ${tirar}, ${c2} ${tirar}, ${medioPeriodo} 0`;
  }
  return `${d} L ${ONDA_ANCHO} ${ONDA_ALTO} L 0 ${ONDA_ALTO} Z`;
}

export function CapaOnda({
  velocidad,
  alto,
  color,
  base,
  amplitud,
  opacidad = 1,
}: {
  velocidad: "a" | "b" | "c" | "d";
  alto: string;
  color: string;
  base: number;
  amplitud: number;
  opacidad?: number;
}) {
  return (
    <div className={`absolute inset-x-0 bottom-0 overflow-hidden ${alto}`}>
      <svg
        role="none"
        aria-hidden="true"
        viewBox={`0 0 ${ONDA_ANCHO} ${ONDA_ALTO}`}
        preserveAspectRatio="none"
        className={`onda onda--${velocidad} h-full`}
      >
        <path d={ondaPath(base, amplitud)} fill={color} opacity={opacidad} />
      </svg>
    </div>
  );
}

interface DefinicionCapa {
  velocidad: "a" | "b" | "c" | "d";
  alto: string;
  color: string;
  base: number;
  amplitud: number;
  opacidad?: number;
}

/*
  Las alturas van en píxeles y no en porcentaje a propósito: en móvil las
  secciones se estiran hasta varios miles de píxeles y un porcentaje deformaba
  las ondas hasta convertirlas en púas verticales.

  "amplio" es para secciones altas (Planes, con cinco tarjetas); "compacto"
  para bandas de una pantalla (Hero, CTA).
*/
type Tamano = "amplio" | "compacto" | "acceso";

const CAPAS: Record<Tamano, DefinicionCapa[]> = {
  amplio: [
    { velocidad: "a", alto: "h-[760px] md:h-[1020px]", color: "#4f46e5", base: 78, amplitud: 30 },
    { velocidad: "b", alto: "h-[650px] md:h-[880px]", color: "#3b82f6", base: 72, amplitud: 26 },
    { velocidad: "c", alto: "h-[540px] md:h-[740px]", color: "#7dd3fc", base: 66, amplitud: 30 },
    { velocidad: "d", alto: "h-[440px] md:h-[600px]", color: "#5eead4", base: 60, amplitud: 24, opacidad: 0.6 },
    { velocidad: "a", alto: "h-[340px] md:h-[460px]", color: "#f8fafc", base: 58, amplitud: 22 },
  ],
  /*
    La pila compacta cierra bandas de una pantalla. Su altura máxima define
    cuánto relleno inferior necesita el contenido de esa sección para no
    quedar tapado: hoy 220px en móvil y 320px de md en adelante.
  */
  compacto: [
    { velocidad: "a", alto: "h-[220px] md:h-[320px]", color: "#4f46e5", base: 78, amplitud: 30 },
    { velocidad: "b", alto: "h-[185px] md:h-[268px]", color: "#3b82f6", base: 72, amplitud: 26 },
    { velocidad: "c", alto: "h-[150px] md:h-[215px]", color: "#7dd3fc", base: 66, amplitud: 30 },
    { velocidad: "d", alto: "h-[118px] md:h-[165px]", color: "#5eead4", base: 60, amplitud: 24, opacidad: 0.6 },
    { velocidad: "a", alto: "h-[86px] md:h-[120px]", color: "#f8fafc", base: 58, amplitud: 22 },
  ],
  /*
    Variante de las pantallas de acceso. Es más baja que la compacta y no
    termina en blanco: allí las ondas cierran contra una sección clara, pero
    aquí la página acaba en el borde inferior y una franja blanca se leería
    como un corte.

    Las dos capas claras van muy translúcidas a propósito. Estas ondas quedan
    fijas a la pantalla mientras la columna del formulario se desplaza, así que
    cualquier texto puede acabar sobre ellas en algún punto del recorrido: con
    el celeste y el turquesa apagados, el violeta sigue mandando por debajo y el
    texto blanco se lee igual de bien caiga donde caiga.
  */
  acceso: [
    { velocidad: "a", alto: "h-[110px] md:h-[150px]", color: "#4f46e5", base: 74, amplitud: 28, opacidad: 0.8 },
    { velocidad: "b", alto: "h-[88px] md:h-[120px]", color: "#3b82f6", base: 70, amplitud: 24, opacidad: 0.62 },
    { velocidad: "c", alto: "h-[66px] md:h-[90px]", color: "#7dd3fc", base: 66, amplitud: 26, opacidad: 0.34 },
    { velocidad: "d", alto: "h-[44px] md:h-[60px]", color: "#5eead4", base: 60, amplitud: 22, opacidad: 0.28 },
  ],
};

/**
 * Pila de ondas anclada al fondo de una banda violeta: la disuelve pasando por
 * índigo, azul, celeste y turquesa hasta el blanco de la sección siguiente.
 */
export function TransicionAClaro({ tamano = "amplio" }: { tamano?: Tamano }) {
  return (
    <>
      {CAPAS[tamano].map((capa) => (
        <CapaOnda
          key={`${capa.color}-${capa.alto}`}
          velocidad={capa.velocidad}
          alto={capa.alto}
          color={capa.color}
          base={capa.base}
          amplitud={capa.amplitud}
          opacidad={capa.opacidad}
        />
      ))}
    </>
  );
}

/*
  Camino inverso: de la sección clara hacia la banda violeta que viene abajo.
  El orden es el mismo (cada capa se rellena hacia abajo desde su onda), pero
  los colores descienden de celeste a violeta profundo y las alturas son
  menores, porque aquí solo se trata de empalmar dos secciones.
*/
const CAPAS_A_OSCURO: DefinicionCapa[] = [
  { velocidad: "b", alto: "h-[170px] md:h-[230px]", color: "#cfe3fb", base: 70, amplitud: 26 },
  { velocidad: "c", alto: "h-[136px] md:h-[185px]", color: "#7aa5f2", base: 66, amplitud: 24 },
  { velocidad: "a", alto: "h-[104px] md:h-[140px]", color: "#4f46e5", base: 62, amplitud: 22 },
  { velocidad: "d", alto: "h-[74px] md:h-[100px]", color: "#4c1d95", base: 58, amplitud: 20 },
  { velocidad: "b", alto: "h-[44px] md:h-[60px]", color: "#2e1065", base: 54, amplitud: 16 },
];

/**
 * Pila de ondas que cierra una sección clara descendiendo hasta el violeta
 * profundo con el que arranca la banda siguiente (Planes, CTA).
 */
export function TransicionAOscuro() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[170px] md:h-[230px]">
      {CAPAS_A_OSCURO.map((capa) => (
        <CapaOnda
          key={`${capa.color}-${capa.alto}`}
          velocidad={capa.velocidad}
          alto={capa.alto}
          color={capa.color}
          base={capa.base}
          amplitud={capa.amplitud}
          opacidad={capa.opacidad}
        />
      ))}
    </div>
  );
}
