// Se usan "type" y no "interface": los type aceptan ser guardados como JSON en Prisma,
// porque TypeScript los considera compatibles con un objeto de claves libres.

/** Datos de contacto del negocio. El WhatsApp va solo con dígitos y código de país (ej. 5491178254471). */
export type Contacto = {
  whatsapp: string;
  email: string;
  instagram: string;
  tiktok: string;
};

/** Banner principal del inicio. */
export type Banner = {
  visible: boolean;
  titulo: string;
  subtitulo: string;
};

/** Una pregunta frecuente con su respuesta. */
export type PreguntaFrecuente = {
  pregunta: string;
  respuesta: string;
};

/** Lista de preguntas frecuentes, en el orden en que se muestran. */
export type Faq = {
  preguntas: PreguntaFrecuente[];
};

/** Condiciones de venta, en formato Markdown. */
export type Condiciones = {
  texto: string;
};

/** Todo el contenido editable del sitio. */
export type ContenidoSitio = {
  contacto: Contacto;
  banner: Banner;
  faq: Faq;
  condiciones: Condiciones;
};

/** Las claves con que se guarda cada sección en la base. */
export type ClaveContenido = keyof ContenidoSitio;

/** Contenido que se usa mientras Marce no haya cargado el suyo: vacío pero válido. */
export const CONTENIDO_POR_DEFECTO: ContenidoSitio = {
  contacto: { whatsapp: '', email: '', instagram: '', tiktok: '' },
  banner: { visible: false, titulo: '', subtitulo: '' },
  faq: { preguntas: [] },
  condiciones: { texto: '' },
};
