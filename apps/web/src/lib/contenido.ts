import type { PreguntaFrecuente } from './api/tipos';

/** Indica si un link apunta a otro sitio (http o https). */
export function esEnlaceExterno(href?: string): boolean {
  return /^https?:\/\//i.test(href ?? '');
}

/** Arma los datos estructurados de schema.org para una página de preguntas frecuentes. */
export function armarFaqEstructurada(preguntas: readonly PreguntaFrecuente[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: preguntas.map((item) => ({
      '@type': 'Question',
      name: item.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: item.respuesta },
    })),
  };
}

/** Convierte datos a JSON para un <script>, escapando "<" para que nadie pueda cerrar la etiqueta. */
export function serializarJsonLd(datos: unknown): string {
  return JSON.stringify(datos).replace(/</g, '\\u003c');
}
