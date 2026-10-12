import type { Metadata } from 'next';
import { TextoMarkdown } from '@/componentes/contenido/texto-markdown';
import { obtenerContenido } from '@/lib/api/consultas';

export const metadata: Metadata = {
  title: 'Condiciones de venta',
  description: 'Formas de pago, envíos y condiciones para comprar en Tienda Alpi.',
};

/** Página con las condiciones de venta que carga Marce desde el panel. */
export default async function PaginaCondiciones() {
  const { condiciones } = await obtenerContenido();
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-titulos text-3xl text-texto sm:text-4xl">Condiciones de venta</h1>
      {condiciones.texto.trim() ? (
        <TextoMarkdown texto={condiciones.texto} />
      ) : (
        <p className="text-texto-suave">Muy pronto vamos a publicar las condiciones de venta.</p>
      )}
    </article>
  );
}
