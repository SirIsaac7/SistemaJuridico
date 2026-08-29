"use client";

import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

import { animate, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, MessageCircle, MonitorSmartphone, Scale, ShieldCheck, UserPlus } from "lucide-react";

import { AuroraTextEffect } from "@/landing/components/lightswind/aurora-text-effect";
import { TransicionAClaro } from "@/landing/components/ondas";

import { CheckoutDialog } from "./checkout-dialog";
import { FadeUp } from "./fade-up";
import { LOGIN_URL, whatsappMessageLink } from "./landing-config";
import { ahorroPeriodo, type Periodicidad, PLANES, type PlanSuscripcion, type PrecioPlan } from "./planes-data";

const REGISTRO_URL = LOGIN_URL.replace("/login", "/register");

/** Período que el usuario elige con la píldora superior. */
type Periodo = "mensual" | "largo";

/** Texto corto que acompaña al precio según su periodicidad. */
const SUFIJO_PERIODO: Record<Periodicidad, string> = {
  mensual: "/ mes",
  semestral: "/ semestre",
  anual: "/ año",
};

/** Meses que cubre cada periodicidad, para calcular el equivalente mensual. */
const MESES_PERIODO: Record<Periodicidad, number> = {
  mensual: 1,
  semestral: 6,
  anual: 12,
};

const ICONO_CTA = {
  gratuito: UserPlus,
  pago: ArrowRight,
  variable: MessageCircle,
} as const;

// Etiquetas cortas: con 5 columnas la tarjeta queda estrecha y un texto largo
// se parte en tres líneas. El aria-label de cada botón conserva la frase completa.
const ETIQUETA_CTA = {
  gratuito: "Crear cuenta",
  pago: "Suscribirme",
  variable: "Cotizar",
} as const;

/** Bs sin decimales cuando el monto es exacto; con un decimal si no lo es. */
function formatearBs(valor: number): string {
  return Number.isInteger(valor) ? String(valor) : valor.toFixed(1);
}

/**
 * Cielo degradado + capas de onda a distinta velocidad.
 *
 * La sección anterior (Áreas de práctica) termina en el mismo violeta profundo
 * con el que arranca esta, así que el empalme superior es continuo y no hace
 * falta ningún velo. Abajo, las ondas disuelven el violeta hasta el blanco con
 * el que empieza Testimonios.
 */
function FondoOndas() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Cielo base claro: garantiza el contraste de las tarjetas a cualquier alto */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#cfe3fb_0%,#e8f1fe_55%,#dbeefb_100%)]" />

      {/* Franja violeta superior */}
      <div className="absolute inset-x-0 top-0 h-[620px] bg-[linear-gradient(180deg,#2e1065_0%,#4c1d95_34%,#5b34d6_64%,#4f7bf0_88%,#cfe3fb_100%)] md:h-[840px]" />

      {/*
        La capa blanca es la más alta a propósito: el aviso de pago seguro y la
        letra chica caen sobre ella, y sobre el turquesa no tendrían contraste.
      */}
      <TransicionAClaro tamano="amplio" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Piezas de la tarjeta                                               */
/* ------------------------------------------------------------------ */

/** Precio que transiciona con un conteo al cambiar de período. */
function PrecioContado({ valor }: { valor: number }) {
  const reducirMovimiento = useReducedMotion();
  const motionValor = useMotionValue(valor);
  const [texto, setTexto] = useState(() => String(valor));

  useEffect(() => {
    if (reducirMovimiento) {
      setTexto(String(valor));
      return;
    }
    const control = animate(motionValor, valor, { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] });
    const cancelar = motionValor.on("change", (v) => setTexto(String(Math.round(v))));
    return () => {
      control.stop();
      cancelar();
    };
  }, [valor, motionValor, reducirMovimiento]);

  return <>{texto}</>;
}

/** Cifra grande de la tarjeta: monto, "Gratis" o "A medida" según el tipo. */
function BloquePrecio({
  plan,
  activo,
  sufijo,
}: {
  plan: PlanSuscripcion;
  activo: PrecioPlan | undefined;
  sufijo: string;
}) {
  if (plan.tipo === "variable") {
    return <span className="font-black text-4xl text-slate-900 leading-none tracking-tight">A medida</span>;
  }

  if (plan.tipo === "gratuito") {
    return <span className="font-black text-6xl text-slate-900 leading-none tracking-tight">Gratis</span>;
  }

  return (
    <>
      <span className="font-bold text-indigo-600 text-xl">Bs</span>
      <span className="font-black text-6xl text-slate-900 leading-none tracking-tight">
        <PrecioContado valor={activo ? activo.precio : 0} />
      </span>
      <span className="whitespace-nowrap font-medium text-slate-500 text-sm">{sufijo}</span>
    </>
  );
}

/** Resalta el concepto inicial del beneficio, como en el referente. */
function Beneficio({ texto }: { texto: string }) {
  const palabras = texto.split(" ");
  const inicio = palabras.slice(0, 2).join(" ");
  const resto = palabras.slice(2).join(" ");

  return (
    <>
      <span className="font-semibold text-slate-900">{inicio}</span>
      {resto ? <span className="text-slate-600"> {resto}</span> : null}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Tarjeta de plan                                                    */
/* ------------------------------------------------------------------ */

function PricingCard({
  plan,
  index,
  periodo,
  onSuscribir,
}: {
  plan: PlanSuscripcion;
  index: number;
  periodo: Periodo;
  onSuscribir: (plan: PlanSuscripcion, periodicidad: Periodicidad | null) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducirMovimiento = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  };

  const spotlight = useMotionTemplate`radial-gradient(320px circle at ${mouseX}px ${mouseY}px, rgba(255,255,255,0.65), transparent 72%)`;

  const mensual = plan.precios.find((p) => p.periodicidad === "mensual");
  const largo = plan.precios.find((p) => p.periodicidad !== "mensual");
  const ahorro = largo ? ahorroPeriodo(plan, largo) : 0;

  // En modo "largo" cae al plan mensual si ese plan no tiene período extendido.
  const activo = periodo === "largo" ? (largo ?? mensual) : mensual;

  const sufijo = activo ? SUFIJO_PERIODO[activo.periodicidad] : "";

  // "equivale a Bs X / mes", como el "billed annually" del referente.
  const mesesCubiertos = activo && activo.periodicidad !== "mensual" ? MESES_PERIODO[activo.periodicidad] : 0;
  const equivalenteTexto = activo && mesesCubiertos ? formatearBs(activo.precio / mesesCubiertos) : null;

  const claseCtaBase =
    "group/cta relative mt-7 flex w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden whitespace-nowrap rounded-full py-2 pr-5 pl-2 text-center font-semibold text-sm transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2";

  const claseCta = plan.destacado
    ? "bg-[linear-gradient(100deg,#4f46e5_0%,#7c3aed_55%,#6366f1_100%)] text-white shadow-[0_14px_34px_-10px_rgba(79,70,229,0.75)] hover:shadow-[0_18px_44px_-10px_rgba(79,70,229,0.9)] focus-visible:outline-[#4f46e5]"
    : "border border-white/80 bg-white/70 text-slate-800 shadow-[0_10px_26px_-12px_rgba(30,41,99,0.5)] hover:bg-white/90 focus-visible:outline-[#4f46e5]";

  const claseBadgeCta = plan.destacado
    ? "bg-white/95 text-indigo-600"
    : "bg-[linear-gradient(135deg,#6366f1_0%,#7c3aed_100%)] text-white";

  const IconoCta = ICONO_CTA[plan.tipo];
  const etiquetaCta = ETIQUETA_CTA[plan.tipo];

  return (
    // Envoltorio externo: escala responsiva del plan destacado. Va aquí y no en
    // el nodo animado porque Framer Motion escribe `transform` en línea y
    // pisaría cualquier clase de escala de Tailwind.
    <div
      className={`flex w-full flex-col sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-18.7px)] 2xl:w-[calc(20%-22.4px)] ${
        plan.destacado ? "max-lg:order-first lg:scale-[1.03]" : "lg:py-7"
      }`}
    >
      <motion.div
        initial={reducirMovimiento ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
        whileHover={reducirMovimiento ? undefined : { y: -10, transition: { duration: 0.3 } }}
        onMouseMove={handleMouseMove}
        className="group flex-1"
      >
        <div className={`relative h-full ${plan.destacado ? "lj-plan-float" : ""}`}>
          {/* Halo exterior del plan destacado */}
          {plan.destacado && (
            <div
              aria-hidden
              className="lj-breathe pointer-events-none absolute -inset-3 rounded-[36px] bg-[radial-gradient(60%_55%_at_50%_20%,rgba(255,255,255,0.55),rgba(125,211,252,0.25)_55%,transparent_78%)] blur-xl"
            />
          )}

          {/* Insignia sobre el borde superior */}
          {plan.destacado && (
            <div className="absolute inset-x-0 -top-4 z-20 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[linear-gradient(100deg,#4f46e5_0%,#7c3aed_100%)] px-4 py-1.5 font-bold text-[10px] text-white uppercase tracking-[0.22em] shadow-[0_10px_24px_-8px_rgba(79,70,229,0.9)]">
                <Scale size={11} /> Más elegido
              </span>
            </div>
          )}

          <div
            ref={cardRef}
            className={`lj-glass-sheen relative flex h-full flex-col overflow-hidden rounded-[28px] border p-7 backdrop-blur-2xl transition-colors duration-300 ${
              plan.destacado
                ? "border-white/80 bg-white/70 shadow-[0_34px_80px_-24px_rgba(30,41,99,0.55)]"
                : "border-white/60 bg-white/55 shadow-[0_24px_60px_-22px_rgba(30,41,99,0.45)] group-hover:bg-white/68"
            }`}
          >
            {/* Lavado turquesa inferior del plan destacado */}
            {plan.destacado && (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(180deg,transparent_0%,rgba(94,234,212,0.28)_100%)]"
              />
            )}

            {/* Luz que sigue al cursor */}
            <motion.div
              aria-hidden
              style={{ background: spotlight }}
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            />

            <div className="relative z-10 flex flex-1 flex-col">
              {/* Nombre del plan */}
              <p className="text-center font-semibold text-[13px] text-slate-500 uppercase tracking-[0.28em]">
                {plan.nombre}
              </p>

              {/* Dispositivos incluidos */}
              <div className="mt-3 flex justify-center">
                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-2.5 py-1 font-semibold text-[11px] text-slate-600">
                  <MonitorSmartphone size={12} className="text-indigo-600" />
                  {plan.dispositivos}
                </span>
              </div>

              <p className="mt-5 mb-5 min-h-14 text-center text-[13px] text-slate-700 leading-relaxed 2xl:min-h-24">
                {plan.descripcion}
              </p>

              {/* Precio */}
              <div className="mb-2 flex min-h-16 items-baseline justify-center gap-1.5">
                <BloquePrecio plan={plan} activo={activo} sufijo={sufijo} />
              </div>

              {/* Nota del período */}
              <div className="mb-6 flex min-h-9 flex-wrap items-center justify-center gap-x-2 gap-y-1.5">
                {plan.tipo === "gratuito" && <span className="text-slate-500 text-xs">para siempre</span>}

                {plan.tipo === "variable" && (
                  <span className="text-center text-slate-500 text-xs">
                    Según el número de dispositivos de su equipo.
                  </span>
                )}

                {plan.tipo === "pago" && periodo === "largo" && equivalenteTexto && (
                  <span className="whitespace-nowrap text-slate-500 text-xs">
                    equivale a <span className="font-semibold text-slate-700">Bs {equivalenteTexto}</span> / mes
                  </span>
                )}

                {plan.tipo === "pago" && periodo === "mensual" && largo && (
                  <span className="whitespace-nowrap text-slate-500 text-xs">
                    o <span className="font-semibold text-indigo-600">Bs {largo.precio}</span>{" "}
                    {largo.periodicidad === "semestral" ? "al semestre" : "al año"}
                  </span>
                )}

                {plan.tipo === "pago" && ahorro > 0 && (
                  <span className="whitespace-nowrap rounded-full bg-[linear-gradient(100deg,#6366f1_0%,#7c3aed_100%)] px-2 py-0.5 font-bold text-[10px] text-white uppercase tracking-wide">
                    Ahorras Bs {ahorro}
                  </span>
                )}
              </div>

              {/* Separador */}
              <div className="mb-6 h-px w-full bg-linear-to-r from-transparent via-slate-900/12 to-transparent" />

              {/* Beneficios */}
              <ul className="flex-1 space-y-3.5">
                {plan.beneficios.map((beneficio) => (
                  <li key={beneficio} className="flex items-start gap-3">
                    <Check size={17} strokeWidth={2.75} className="mt-0.5 shrink-0 text-indigo-600" />
                    <span className="text-[13.5px] leading-relaxed">
                      <Beneficio texto={beneficio} />
                    </span>
                  </li>
                ))}
              </ul>

              {/* Acción (siempre al fondo de la tarjeta) */}
              {plan.tipo === "pago" ? (
                <motion.button
                  type="button"
                  onClick={() => onSuscribir(plan, activo ? activo.periodicidad : plan.precios[0].periodicidad)}
                  aria-label={`Suscribirme al plan ${plan.nombre}`}
                  whileHover={reducirMovimiento ? undefined : { scale: 1.02 }}
                  whileTap={reducirMovimiento ? undefined : { scale: 0.98 }}
                  className={`${claseCtaBase} ${claseCta}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${claseBadgeCta}`}>
                    <IconoCta size={15} />
                  </span>
                  {etiquetaCta}
                </motion.button>
              ) : (
                <motion.a
                  href={
                    plan.tipo === "gratuito"
                      ? REGISTRO_URL
                      : whatsappMessageLink(
                          "Hola, deseo una cotización del Plan Empresarial de Normativa Virtual (N dispositivos).",
                        )
                  }
                  target={plan.tipo === "variable" ? "_blank" : undefined}
                  rel={plan.tipo === "variable" ? "noopener noreferrer" : undefined}
                  aria-label={
                    plan.tipo === "gratuito"
                      ? "Crear cuenta gratis en Normativa Virtual"
                      : `Solicitar cotización del plan ${plan.nombre}`
                  }
                  whileHover={reducirMovimiento ? undefined : { scale: 1.02 }}
                  whileTap={reducirMovimiento ? undefined : { scale: 0.98 }}
                  className={`${claseCtaBase} ${claseCta}`}
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${claseBadgeCta}`}>
                    <IconoCta size={15} />
                  </span>
                  {etiquetaCta}
                </motion.a>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Selector de período                                                */
/* ------------------------------------------------------------------ */

function SelectorPeriodo({ periodo, onCambiar }: { periodo: Periodo; onCambiar: (p: Periodo) => void }) {
  const opciones: { valor: Periodo; etiqueta: string }[] = [
    { valor: "mensual", etiqueta: "Mensual" },
    { valor: "largo", etiqueta: "Anual" },
  ];

  return (
    <fieldset
      aria-label="Período de facturación"
      className="m-0 inline-flex min-w-0 items-center gap-1 rounded-full border border-white/25 bg-white/10 p-1.5 backdrop-blur-xl"
    >
      {opciones.map((opcion) => {
        const activa = periodo === opcion.valor;
        return (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={activa}
            onClick={() => onCambiar(opcion.valor)}
            className="relative cursor-pointer rounded-full px-7 py-2.5 font-semibold text-[15px] transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2"
          >
            {activa && (
              <motion.span
                aria-hidden
                layoutId="lj-periodo-activo"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
                className="absolute inset-0 rounded-full bg-white shadow-[0_8px_22px_-8px_rgba(15,23,42,0.6)]"
              />
            )}
            <span className={`relative z-10 ${activa ? "text-[#3b1a8c]" : "text-white/80 hover:text-white"}`}>
              {opcion.etiqueta}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}

/* ------------------------------------------------------------------ */
/*  Sección                                                            */
/* ------------------------------------------------------------------ */

/** Las dos líneas del titular de la sección. Cada una entra por separado. */
const LINEAS_TITULAR = ["Planes simples.", "Beneficios poderosos."];

export function Pricing() {
  const [periodo, setPeriodo] = useState<Periodo>("mensual");
  const [planSeleccionado, setPlanSeleccionado] = useState<PlanSuscripcion | null>(null);
  const [periodicidadInicial, setPeriodicidadInicial] = useState<Periodicidad | null>(null);

  const abrirCheckout = (plan: PlanSuscripcion, periodicidad: Periodicidad | null) => {
    setPlanSeleccionado(plan);
    setPeriodicidadInicial(periodicidad);
  };

  return (
    <section id="planes" className="relative overflow-hidden pt-24 pb-28 md:pt-32 md:pb-32 xl:pt-40 xl:pb-36">
      <FondoOndas />

      <div className="lj-container relative">
        {/* Encabezado, sobre la franja violeta */}
        <div className="mb-10 text-center md:mb-14">
          <FadeUp>
            <span className="mb-4 block font-semibold text-[13px] text-white/70 uppercase tracking-[0.25em]">
              Planes y promociones
            </span>
          </FadeUp>
          {/*
            El reveal lo maneja FadeUp, que es el mismo useInView que usa el
            resto de la sección y que aquí sí dispara de forma fiable. La aurora
            va por dentro del texto; el desplazamiento, por fuera: un transform
            sobre el propio texto rompería el recorte del degradado.
          */}
          <h2 className="lj-font-heading font-black text-3xl uppercase tracking-[0.06em] sm:text-4xl md:text-5xl">
            {LINEAS_TITULAR.map((linea, i) => (
              <FadeUp key={linea} delay={0.1 + i * 0.15} duration={0.8}>
                <AuroraTextEffect text={linea} speed={9} className="block pb-[0.08em]" />
              </FadeUp>
            ))}
          </h2>
          <FadeUp delay={0.2}>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/70">
              Elige el plan que mejor se adapte a tus necesidades jurídicas.
            </p>
          </FadeUp>
        </div>

        {/* Selector Mensual / Anual */}
        <FadeUp delay={0.25} className="mb-12 flex justify-center md:mb-16">
          <SelectorPeriodo periodo={periodo} onCambiar={setPeriodo} />
        </FadeUp>

        {/*
          Tarjetas: el plan destacado sobresale en escritorio y aparece primero
          en móvil. Va en flex y no en grid porque con cinco planes la última
          fila queda incompleta, y así se centra en lugar de pegarse a la
          izquierda. Los anchos descuentan el hueco que le toca a cada tarjeta.
        */}
        <div className="mx-auto flex max-w-7xl flex-wrap items-stretch justify-center gap-6 pt-2 lg:gap-7">
          {PLANES.map((plan, i) => (
            <PricingCard key={plan.codigo} plan={plan} index={i} periodo={periodo} onSuscribir={abrirCheckout} />
          ))}
        </div>

        <FadeUp delay={0.3} className="mt-14 text-center">
          <p className="mx-auto flex max-w-2xl items-center justify-center gap-2 text-slate-700 text-sm">
            <ShieldCheck size={15} className="shrink-0 text-indigo-600" />
            Pago seguro con QR del Banco Nacional de Bolivia: escaneas desde la app de tu banco.
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-slate-500 text-xs">
            Precios en bolivianos (Bs). Importante: cada usuario y contraseña habilita 1 solo dispositivo — quedará
            vinculado al primer equipo en el que inicies sesión y no podrá usarse en otro.
          </p>
        </FadeUp>
      </div>

      {/* Checkout: popup de datos del cliente + facturación opcional */}
      <CheckoutDialog
        plan={planSeleccionado}
        periodicidadInicial={periodicidadInicial}
        onClose={() => setPlanSeleccionado(null)}
      />
    </section>
  );
}
