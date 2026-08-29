/**
 * Validaciones del formulario público de contacto.
 *
 * Son un espejo de `Backend/apps/contacto/validators.py`: aquí sirven para
 * avisar al instante mientras la persona escribe, pero la palabra final la
 * tiene el servidor (un POST directo al API se salta este archivo).
 * Si se agrega una grosería en un lado, agregarla también en el otro.
 */

export const LONGITUD_WHATSAPP = 8;
export const CODIGO_PAIS_BOLIVIA = "591";
const PREFIJOS_CELULAR = ["6", "7"];

const RE_NOMBRE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ '-][A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*$/;
const RE_EMAIL = /^[^@\s]+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const DOMINIOS_DESECHABLES = new Set([
  "mailinator.com",
  "yopmail.com",
  "tempmail.com",
  "temp-mail.org",
  "10minutemail.com",
  "guerrillamail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "maildrop.cc",
  "fakeinbox.com",
  "throwawaymail.com",
]);

// Se comparan como palabra completa: términos jurídicos legítimos como
// "putativo" o apellidos como "Concha" no se ven afectados.
const PALABRAS_PROHIBIDAS = new Set([
  "mierda",
  "mierdas",
  "carajo",
  "puta",
  "putas",
  "puto",
  "putos",
  "puteada",
  "hijueputa",
  "hijoputa",
  "hdp",
  "malparido",
  "malparida",
  "pendejo",
  "pendeja",
  "pendejos",
  "pendejas",
  "cabron",
  "cabrona",
  "cabrones",
  "gilipollas",
  "boludo",
  "boluda",
  "pelotudo",
  "pelotuda",
  "huevon",
  "huevona",
  "webon",
  "weon",
  "conchudo",
  "conchuda",
  "joder",
  "jodete",
  "jodanse",
  "coño",
  "puñeta",
  "puñetas",
  "verga",
  "vergas",
  "pinche",
  "chinga",
  "chingar",
  "chingada",
  "culero",
  "culiado",
  "culiao",
  "maricon",
  "maricona",
  "maricones",
  "zorra",
  "zorras",
  "imbecil",
  "imbeciles",
  "estupido",
  "estupida",
  "estupidos",
  "estupidas",
  "idiota",
  "idiotas",
  "tarado",
  "tarada",
  "subnormal",
  "mamon",
  "mamona",
  "follar",
  "sorete",
  "cagada",
  "cagar",
  "cagon",
  "chupame",
  "lameculos",
  "fuck",
  "fucking",
  "shit",
  "bitch",
  "asshole",
  "bastard",
]);

// Disfraces habituales: m1erd@ termina siendo "mierda".
const SUSTITUCIONES: Record<string, string> = {
  "@": "a",
  "4": "a",
  "0": "o",
  "1": "i",
  "!": "i",
  "3": "e",
  $: "s",
  "5": "s",
  "7": "t",
};

function comprimir(palabra: string) {
  return palabra.replace(/(.)\1+/g, "$1");
}

const PALABRAS_PROHIBIDAS_COMPRIMIDAS = new Set([...PALABRAS_PROHIBIDAS].map(comprimir));

// Marcador temporal (carácter de control) para que la eñe sobreviva al
// borrado de tildes: sin esto "coño" se confundiría con la palabra "cono".
const MARCA_ENIE = String.fromCharCode(1);

/** Minúsculas, sin acentos, sin disfraces y sin letras repetidas. */
export function normalizarTexto(texto: string) {
  return texto
    .replace(/[ñÑ]/g, MARCA_ENIE)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[@40135$!7]/g, (caracter) => SUSTITUCIONES[caracter] ?? caracter)
    .split(MARCA_ENIE)
    .join("ñ")
    .replace(/(.)\1{2,}/g, "$1$1"); // "holaaaa" → "holaa"
}

/** Groserías encontradas en el texto (sin repetir). */
export function palabrasOfensivas(texto: string): string[] {
  const encontradas: string[] = [];
  for (const palabra of normalizarTexto(texto).match(/[a-zñ]+/g) ?? []) {
    const ofensiva = PALABRAS_PROHIBIDAS.has(palabra) || PALABRAS_PROHIBIDAS_COMPRIMIDAS.has(comprimir(palabra));
    if (ofensiva && !encontradas.includes(palabra)) encontradas.push(palabra);
  }
  return encontradas;
}

export function contieneLenguajeOfensivo(texto: string) {
  return palabrasOfensivas(texto).length > 0;
}

/** Deja solo dígitos y quita el código de país si vino incluido. */
export function normalizarWhatsapp(valor: string) {
  const digitos = valor.replace(/\D/g, "");
  if (digitos.length > LONGITUD_WHATSAPP && digitos.startsWith(CODIGO_PAIS_BOLIVIA)) {
    return digitos.slice(CODIGO_PAIS_BOLIVIA.length);
  }
  return digitos;
}

/* -------------------------------------------------------------------------- */
/*        Validadores de campo: devuelven el error o null si está bien         */
/* -------------------------------------------------------------------------- */

export function validarNombre(valor: string): string | null {
  const nombre = valor.trim().replace(/\s+/g, " ");
  if (!nombre) return "Ingrese su nombre completo.";
  if (nombre.length < 3) return "El nombre debe tener al menos 3 caracteres.";
  if (nombre.length > 120) return "El nombre no puede superar los 120 caracteres.";
  if (!RE_NOMBRE.test(nombre)) return "El nombre solo puede contener letras y espacios.";
  if (contieneLenguajeOfensivo(nombre)) return "El nombre contiene lenguaje inapropiado.";
  return null;
}

export function validarEmail(valor: string): string | null {
  const email = valor.trim().toLowerCase();
  if (!email) return "Ingrese su correo electrónico.";
  if (!RE_EMAIL.test(email)) return "Ingrese un correo válido (ejemplo: nombre@dominio.com).";
  if (DOMINIOS_DESECHABLES.has(email.split("@")[1] ?? "")) {
    return "No se aceptan correos temporales. Use un correo personal o laboral.";
  }
  return null;
}

export function validarWhatsapp(valor: string): string | null {
  if (/[^\d\s+()-]/.test(valor)) return "El número de WhatsApp solo puede contener dígitos.";
  const numero = normalizarWhatsapp(valor);
  if (!numero) return "Ingrese su número de WhatsApp.";
  if (numero.length !== LONGITUD_WHATSAPP) return `El número debe tener exactamente ${LONGITUD_WHATSAPP} dígitos.`;
  if (!PREFIJOS_CELULAR.includes(numero[0])) {
    return "Debe ser un celular con WhatsApp: en Bolivia empiezan en 6 o 7.";
  }
  return null;
}

export function validarMensaje(valor: string): string | null {
  const mensaje = valor.trim();
  if (!mensaje) return "Escriba su consulta.";
  if (mensaje.length < 15) return "Cuéntenos un poco más: al menos 15 caracteres.";
  if (mensaje.length > 1500) return "La consulta no puede superar los 1500 caracteres.";
  if (contieneLenguajeOfensivo(mensaje)) return "Por favor reformule su consulta sin lenguaje ofensivo.";
  return null;
}
