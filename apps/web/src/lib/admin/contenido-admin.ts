import type { Banner, Contacto, PreguntaFrecuente } from '../api/tipos';
import type { Errores } from './formulario-producto';

const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FORMATO_INSTAGRAM = /^[A-Za-z0-9._]{1,30}$/;
const FORMATO_TIKTOK = /^[A-Za-z0-9._]{2,24}$/;

/** Quita espacios y la "@" inicial de un usuario de red social. */
export function limpiarUsuario(texto: string): string {
  return texto.trim().replace(/^@/, '');
}

/** Deja solo los dígitos del WhatsApp ("+54 9 11 7825-4471" queda "5491178254471"). */
export function limpiarWhatsapp(texto: string): string {
  return texto.replace(/\D/g, '');
}

/** Revisa los datos de contacto con las mismas reglas que la API. */
export function validarContacto(contacto: Contacto): Errores<Contacto> {
  const errores: Errores<Contacto> = {};
  if (!/^\d{10,15}$/.test(limpiarWhatsapp(contacto.whatsapp))) {
    errores.whatsapp = 'Entre 10 y 15 dígitos, con código de país (ej. 5491178254471).';
  }
  const email = contacto.email.trim();
  if (email && (!FORMATO_EMAIL.test(email) || email.length > 160)) errores.email = 'Ingresá un email válido.';
  const instagram = limpiarUsuario(contacto.instagram);
  if (instagram && !FORMATO_INSTAGRAM.test(instagram)) {
    errores.instagram = 'Solo letras, números, puntos y guiones bajos (hasta 30).';
  }
  const tiktok = limpiarUsuario(contacto.tiktok);
  if (tiktok && !FORMATO_TIKTOK.test(tiktok)) {
    errores.tiktok = 'Solo letras, números, puntos y guiones bajos (de 2 a 24).';
  }
  return errores;
}

/** Arma el cuerpo para la API: los campos opcionales vacíos no se envían. */
export function convertirContacto(contacto: Contacto): Partial<Contacto> & { whatsapp: string } {
  const cuerpo: Partial<Contacto> & { whatsapp: string } = { whatsapp: limpiarWhatsapp(contacto.whatsapp) };
  const email = contacto.email.trim().toLowerCase();
  const instagram = limpiarUsuario(contacto.instagram);
  const tiktok = limpiarUsuario(contacto.tiktok);
  if (email) cuerpo.email = email;
  if (instagram) cuerpo.instagram = instagram;
  if (tiktok) cuerpo.tiktok = tiktok;
  return cuerpo;
}

/** Revisa el banner con las mismas reglas que la API. */
export function validarBanner(banner: Banner): Errores<Banner> {
  const errores: Errores<Banner> = {};
  const titulo = banner.titulo.trim();
  if (titulo.length < 1 || titulo.length > 80) errores.titulo = 'Entre 1 y 80 caracteres.';
  if (banner.subtitulo.trim().length > 160) errores.subtitulo = 'Hasta 160 caracteres.';
  return errores;
}

/** Revisa una pregunta frecuente con las mismas reglas que la API. */
export function validarPregunta(item: PreguntaFrecuente): Errores<PreguntaFrecuente> {
  const errores: Errores<PreguntaFrecuente> = {};
  const pregunta = item.pregunta.trim();
  if (pregunta.length < 5 || pregunta.length > 200) errores.pregunta = 'Entre 5 y 200 caracteres.';
  const respuesta = item.respuesta.trim();
  if (respuesta.length < 1 || respuesta.length > 2000) errores.respuesta = 'Entre 1 y 2000 caracteres.';
  return errores;
}

/** Mueve un elemento de una posición a otra; si alguna posición no existe, deja la lista igual. */
export function moverElemento<T>(lista: readonly T[], desde: number, hasta: number): T[] {
  if (desde < 0 || hasta < 0 || desde >= lista.length || hasta >= lista.length) return [...lista];
  const copia = [...lista];
  const [elemento] = copia.splice(desde, 1);
  copia.splice(hasta, 0, elemento);
  return copia;
}
