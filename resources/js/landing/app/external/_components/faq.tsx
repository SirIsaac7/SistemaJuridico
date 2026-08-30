'use client';

import { type FormEvent, useState } from 'react';

import { showNotification } from '@/lib/sweet-alert';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Minus, Plus, Send } from 'lucide-react';

import { TransicionAOscuro } from '@/landing/components/ondas';
import {
    LONGITUD_WHATSAPP,
    normalizarWhatsapp,
    validarEmail,
    validarMensaje,
    validarNombre,
    validarWhatsapp,
} from '@/landing/lib/validaciones/texto';

import { FadeUp, SlideIn } from './fade-up';
import { WHATSAPP_LOCAL } from './landing-config';

const LARGO_MAXIMO_CONSULTA = 1500;

type CampoConsulta = 'nombre' | 'email' | 'whatsapp' | 'mensaje';
type ErroresConsulta = Partial<Record<CampoConsulta, string>>;

/** Extrae el mensaje de error que devolvió el API (por campo o general). */
function mensajeDeError(datos: unknown): { errores: ErroresConsulta; general: string | null } {
    if (!datos || typeof datos !== 'object') return { errores: {}, general: null };

    const registro = datos as Record<string, unknown>;
    const errores: ErroresConsulta = {};
    for (const campo of ['nombre', 'email', 'whatsapp', 'mensaje'] as const) {
        const valor = registro[campo];
        if (Array.isArray(valor) && typeof valor[0] === 'string') errores[campo] = valor[0];
        else if (typeof valor === 'string') errores[campo] = valor;
    }

    const general = typeof registro.detail === 'string' ? registro.detail : null;
    return { errores, general };
}

const faqs = [
    {
        q: '¿Cómo agendo una cita o asesoría?',
        a: `Puede solicitarla desde el formulario de esta página, por WhatsApp al ${WHATSAPP_LOCAL} o llamando directamente. Confirmamos fecha y hora el mismo día y le enviamos un recordatorio antes de la reunión.`,
    },
    {
        q: '¿Atienden consultas virtuales?',
        a: 'Sí. Ofrecemos asesorías por videollamada con la misma calidad y validez que una reunión presencial. Ideal para clientes con agendas exigentes o que se encuentran en otra ciudad.',
    },
    {
        q: '¿Cómo protegen mi información?',
        a: 'Toda su información se resguarda en nuestro sistema con acceso controlado por usuarios y roles: solo el personal autorizado de su caso puede verla. Además, mantenemos respaldo digital y estricta confidencialidad profesional.',
    },
    {
        q: '¿Puedo hacer seguimiento a mi caso?',
        a: 'Sí. Recibirá reportes periódicos del estado de su caso y, según su plan, acceso al portal del cliente para consultar avances, documentos y próximas audiencias en cualquier momento.',
    },
    {
        q: '¿Qué áreas del derecho cubren?',
        a: 'Atendemos derecho civil, penal, laboral, de familia, corporativo, tributario, notarial y constitucional, entre otros. Si su caso requiere una especialidad distinta, lo orientamos con total transparencia.',
    },
    {
        q: '¿Cuánto cuestan los servicios?',
        a: 'La primera evaluación de su caso no tiene costo. Luego puede optar por una consulta puntual o por un plan mensual; siempre conocerá los honorarios por adelantado, sin sorpresas.',
    },
];

function AccordionItem({ q, a, index }: { q: string; a: string; index: number }) {
    const [open, setOpen] = useState(false);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            className="border-b border-slate-900/10"
        >
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="group flex w-full items-start justify-between gap-4 py-6 text-left"
                aria-expanded={open}
            >
                <span
                    className={`text-base font-semibold transition-colors duration-200 ${
                        open ? 'text-indigo-600' : 'text-slate-900 group-hover:text-indigo-600'
                    }`}
                >
                    {q}
                </span>
                <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all duration-200 ${
                        open
                            ? 'border-transparent bg-[linear-gradient(135deg,#6366f1,#7c3aed)] text-white'
                            : 'border-slate-300 text-slate-500 group-hover:border-indigo-400 group-hover:text-indigo-600'
                    }`}
                >
                    {open ? <Minus size={12} /> : <Plus size={12} />}
                </div>
            </button>
            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <p className="pb-6 text-sm leading-relaxed text-slate-600">{a}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

/** Campo de texto de la landing con etiqueta, prefijo opcional y error. */
function CampoTexto({
    id,
    etiqueta,
    valor,
    onChange,
    onBlur,
    placeholder,
    error,
    ayuda,
    prefijo,
    tipo = 'text',
    inputMode,
    maxLength,
}: {
    readonly id: string;
    readonly etiqueta: string;
    readonly valor: string;
    readonly onChange: (valor: string) => void;
    readonly onBlur: () => void;
    readonly placeholder: string;
    readonly error?: string;
    readonly ayuda?: string;
    readonly prefijo?: string;
    readonly tipo?: 'text' | 'email' | 'tel';
    readonly inputMode?: 'numeric' | 'email' | 'text';
    readonly maxLength?: number;
}) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-xs font-semibold tracking-wider text-slate-500 uppercase">
                {etiqueta}
            </label>
            <div
                className={`flex items-center rounded-xl border bg-white/80 transition-colors focus-within:border-indigo-500 ${
                    error ? 'border-red-400 focus-within:border-red-500' : 'border-slate-200'
                }`}
            >
                {prefijo ? <span className="border-r border-slate-200 py-3 pr-3 pl-4 text-sm text-slate-500 tabular-nums">{prefijo}</span> : null}
                <input
                    id={id}
                    type={tipo}
                    inputMode={inputMode}
                    value={valor}
                    maxLength={maxLength}
                    onChange={(e) => onChange(e.target.value)}
                    onBlur={onBlur}
                    placeholder={placeholder}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? `${id}-error` : undefined}
                    className="w-full bg-transparent px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:outline-none sm:text-sm"
                />
            </div>
            {error ? (
                <p id={`${id}-error`} className="mt-1.5 text-xs text-red-500">
                    {error}
                </p>
            ) : null}
            {!error && ayuda ? <p className="mt-1.5 text-xs text-slate-500">{ayuda}</p> : null}
        </div>
    );
}

export function Faq() {
    const [submitted, setSubmitted] = useState(false);
    const [enviando, setEnviando] = useState(false);
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [errores, setErrores] = useState<ErroresConsulta>({});
    const [tocados, setTocados] = useState<Partial<Record<CampoConsulta, boolean>>>({});

    const validaciones: Record<CampoConsulta, string | null> = {
        nombre: validarNombre(nombre),
        email: validarEmail(email),
        whatsapp: validarWhatsapp(whatsapp),
        mensaje: validarMensaje(mensaje),
    };

    // El error se muestra recién cuando la persona salió del campo o ya intentó
    // enviar: así no aparece en rojo mientras todavía está escribiendo.
    const errorDe = (campo: CampoConsulta) => errores[campo] ?? (tocados[campo] ? (validaciones[campo] ?? undefined) : undefined);

    const marcarTocado = (campo: CampoConsulta) => setTocados((previos) => ({ ...previos, [campo]: true }));

    const alCambiar = (campo: CampoConsulta, valor: string, asignar: (v: string) => void) => {
        asignar(valor);
        // Un error del servidor deja de tener sentido en cuanto se edita el campo.
        if (errores[campo]) {
            setErrores((previos) => {
                const resto = { ...previos };
                delete resto[campo];
                return resto;
            });
        }
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (enviando) return;

        setTocados({ nombre: true, email: true, whatsapp: true, mensaje: true });

        const erroresLocales: ErroresConsulta = {};
        for (const [campo, error] of Object.entries(validaciones) as [CampoConsulta, string | null][]) {
            if (error) erroresLocales[campo] = error;
        }
        if (Object.keys(erroresLocales).length > 0) {
            setErrores(erroresLocales);
            showNotification('error', 'Revise los campos marcados en rojo.');
            return;
        }

        setEnviando(true);
        try {
            const respuesta = await fetch('/api/contacto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: nombre.trim().replace(/\s+/g, ' '),
                    email: email.trim().toLowerCase(),
                    whatsapp: normalizarWhatsapp(whatsapp),
                    mensaje: mensaje.trim(),
                }),
            });
            const datos: unknown = await respuesta.json().catch(() => null);

            if (!respuesta.ok) {
                const { errores: erroresApi, general } = mensajeDeError(datos);
                setErrores(erroresApi);
                const primero = Object.values(erroresApi)[0];
                showNotification('error', general ?? primero ?? 'No se pudo enviar la consulta. Inténtelo nuevamente.');
                return;
            }

            showNotification('success', 'Su consulta fue enviada. Le responderemos a la brevedad.');
            setSubmitted(true);
        } catch {
            showNotification('error', 'No se pudo enviar la consulta. Revise su conexión e inténtelo nuevamente.');
        } finally {
            setEnviando(false);
        }
    };

    return (
        // El relleno inferior extra deja libre la franja de ondas que desciende
        // hacia el violeta con el que arranca la banda de llamada a la acción.
        <section
            id="contacto"
            className="relative overflow-hidden bg-[linear-gradient(180deg,#eef4ff_0%,#f8fafc_55%,#eef4ff_100%)] pt-16 pb-56 md:pt-24 md:pb-72 xl:pt-30"
        >
            <div className="lj-container relative z-10">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
                    {/* Preguntas frecuentes */}
                    <div>
                        <FadeUp>
                            <span className="mb-4 block text-xs font-semibold tracking-[0.25em] text-indigo-600 uppercase">Preguntas frecuentes</span>
                        </FadeUp>
                        <FadeUp delay={0.1}>
                            <h2 className="lj-font-heading mb-10 text-3xl font-black text-slate-900 uppercase sm:text-4xl md:text-5xl">
                                Resolvemos
                                <br />
                                <span className="lj-gradient-indigo">sus dudas</span>
                            </h2>
                        </FadeUp>
                        <div>
                            {faqs.map((faq, i) => (
                                <AccordionItem key={faq.q} q={faq.q} a={faq.a} index={i} />
                            ))}
                        </div>
                    </div>

                    {/* Formulario de contacto */}
                    <SlideIn direction="right">
                        <div className="lj-glass lj-glass-sheen relative rounded-3xl p-6 sm:p-8 md:p-10">
                            <div className="relative z-10">
                                <span className="mb-4 block text-xs font-semibold tracking-[0.25em] text-indigo-600 uppercase">Contáctenos</span>
                                <h3 className="lj-font-heading mb-2 text-3xl leading-tight font-black text-slate-900 uppercase md:text-4xl">
                                    Solicite su
                                    <br />
                                    asesoría hoy
                                </h3>
                                <p className="mb-8 text-sm text-slate-600">
                                    Escríbanos su consulta y un asesor jurídico le responderá en menos de 24 horas.
                                </p>

                                {submitted ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center py-16 text-center"
                                    >
                                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[linear-gradient(135deg,#6366f1,#7c3aed)] shadow-[0_14px_34px_-10px_rgba(79,70,229,0.8)]">
                                            <Send size={24} className="text-white" />
                                        </div>
                                        <h4 className="lj-font-heading mb-2 text-2xl font-black text-slate-900 uppercase">¡Consulta enviada!</h4>
                                        <p className="text-sm text-slate-600">Un asesor jurídico se comunicará con usted en menos de 24 horas.</p>
                                    </motion.div>
                                ) : (
                                    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                            <CampoTexto
                                                id="lj-nombre"
                                                etiqueta="Nombre completo"
                                                placeholder="Ej.: María Fernández"
                                                valor={nombre}
                                                error={errorDe('nombre')}
                                                maxLength={120}
                                                onChange={(valor) => alCambiar('nombre', valor, setNombre)}
                                                onBlur={() => marcarTocado('nombre')}
                                            />
                                            <CampoTexto
                                                id="lj-correo"
                                                etiqueta="Correo electrónico"
                                                tipo="email"
                                                placeholder="maria@correo.com"
                                                valor={email}
                                                error={errorDe('email')}
                                                maxLength={254}
                                                onChange={(valor) => alCambiar('email', valor, setEmail)}
                                                onBlur={() => marcarTocado('email')}
                                            />
                                        </div>

                                        <CampoTexto
                                            id="lj-whatsapp"
                                            etiqueta="WhatsApp"
                                            tipo="tel"
                                            inputMode="numeric"
                                            prefijo="+591"
                                            placeholder="70123456"
                                            ayuda={`${LONGITUD_WHATSAPP} dígitos, sin espacios. Es el número por el que le escribiremos.`}
                                            valor={whatsapp}
                                            error={errorDe('whatsapp')}
                                            maxLength={LONGITUD_WHATSAPP}
                                            // Solo dígitos: cualquier otra tecla simplemente no entra.
                                            onChange={(valor) =>
                                                alCambiar('whatsapp', valor.replace(/\D/g, '').slice(0, LONGITUD_WHATSAPP), setWhatsapp)
                                            }
                                            onBlur={() => marcarTocado('whatsapp')}
                                        />

                                        <div>
                                            <label
                                                htmlFor="lj-mensaje"
                                                className="mb-2 block text-xs font-semibold tracking-wider text-slate-500 uppercase"
                                            >
                                                Su consulta
                                            </label>
                                            <textarea
                                                id="lj-mensaje"
                                                rows={5}
                                                value={mensaje}
                                                maxLength={LARGO_MAXIMO_CONSULTA}
                                                onChange={(e) => alCambiar('mensaje', e.target.value, setMensaje)}
                                                onBlur={() => marcarTocado('mensaje')}
                                                aria-invalid={Boolean(errorDe('mensaje'))}
                                                aria-describedby={errorDe('mensaje') ? 'lj-mensaje-error' : undefined}
                                                placeholder="Cuéntenos brevemente su caso o consulta legal..."
                                                className={`w-full resize-none rounded-xl border bg-white/80 px-4 py-3 text-base text-slate-900 transition-colors placeholder:text-slate-400 focus:outline-none sm:text-sm ${
                                                    errorDe('mensaje')
                                                        ? 'border-red-400 focus:border-red-500'
                                                        : 'border-slate-200 focus:border-indigo-500'
                                                }`}
                                            />
                                            <div className="mt-1.5 flex items-start justify-between gap-3">
                                                {errorDe('mensaje') ? (
                                                    <p id="lj-mensaje-error" className="text-xs text-red-500">
                                                        {errorDe('mensaje')}
                                                    </p>
                                                ) : (
                                                    <span />
                                                )}
                                                <span className="shrink-0 text-xs text-slate-500 tabular-nums">
                                                    {mensaje.trim().length}/{LARGO_MAXIMO_CONSULTA}
                                                </span>
                                            </div>
                                        </div>

                                        <motion.button
                                            type="submit"
                                            disabled={enviando}
                                            whileHover={enviando ? undefined : { scale: 1.02 }}
                                            whileTap={enviando ? undefined : { scale: 0.98 }}
                                            className="lj-btn-shine relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-[linear-gradient(100deg,#4f46e5_0%,#7c3aed_100%)] py-4 text-[15px] font-semibold text-white shadow-[0_14px_34px_-10px_rgba(79,70,229,0.75)] transition-all duration-200 hover:shadow-[0_18px_44px_-10px_rgba(79,70,229,0.9)] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:shadow-none"
                                        >
                                            {enviando ? (
                                                <>
                                                    Enviando <Loader2 size={14} className="animate-spin" />
                                                </>
                                            ) : (
                                                <>
                                                    Enviar consulta <Send size={14} />
                                                </>
                                            )}
                                        </motion.button>

                                        <p className="text-center text-xs text-slate-500">
                                            Su consulta queda registrada en el sistema y un asesor jurídico le responderá por WhatsApp o correo.
                                        </p>
                                    </form>
                                )}
                            </div>
                        </div>
                    </SlideIn>
                </div>
            </div>

            {/* Descenso al violeta con el que arranca la llamada a la acción */}
            <TransicionAOscuro />
        </section>
    );
}
