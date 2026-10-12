import type { Metadata } from 'next';
import { TextoMarkdown } from '@/componentes/contenido/texto-markdown';
import type { PreguntaFrecuente } from '@/lib/api/tipos';
import { obtenerContenido } from '@/lib/api/consultas';
import { armarFaqEstructurada, serializarJsonLd } from '@/lib/contenido';
import { crearEnlaceWhatsApp } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Preguntas frecuentes',
  description: 'Respuestas sobre envíos, pagos, precios por cantidad y productos de Tienda Alpi.',
};

/** Una pregunta desplegable; la respuesta admite Markdown. */
function Pregunta({ item }: { item: PreguntaFrecuente }) {
  return (
    <details className="group rounded-2xl border border-borde bg-superficie p-5">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-texto [&::-webkit-details-marker]:hidden">
        {item.pregunta}
        <span aria-hidden="true" className="text-2xl leading-none text-acento transition group-open:rotate-45">
          +
        </span>
      </summary>
      <div className="mt-3">
        <TextoMarkdown texto={item.respuesta} />
      </div>
    </details>
  );
}

/** Página de preguntas frecuentes, con datos estructurados para buscadores. */
export default async function PaginaPreguntasFrecuentes() {
  const { faq, contacto } = await obtenerContenido();
  const { preguntas } = faq;
  return (
    <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-titulos text-3xl text-texto sm:text-4xl">Preguntas frecuentes</h1>

      {preguntas.length > 0 ? (
        <>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializarJsonLd(armarFaqEstructurada(preguntas)) }}
          />
          <div className="flex flex-col gap-3">
            {preguntas.map((item, indice) => (
              <Pregunta key={indice} item={item} />
            ))}
          </div>
        </>
      ) : (
        <p className="text-texto-suave">Todavía no hay preguntas cargadas.</p>
      )}

      {contacto.whatsapp && (
        <div className="mt-10 rounded-2xl bg-acento-suave p-6 text-center">
          <p className="font-titulos text-xl text-acento-tinta">¿No encontraste tu respuesta?</p>
          <a
            href={crearEnlaceWhatsApp(contacto.whatsapp, '¡Hola! Tengo una consulta.')}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block rounded-full bg-acento px-6 py-3 font-semibold text-white transition hover:bg-acento-oscuro"
          >
            Escribinos por WhatsApp
          </a>
        </div>
      )}
    </section>
  );
}
