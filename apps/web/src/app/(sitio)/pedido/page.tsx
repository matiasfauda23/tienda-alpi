import type { Metadata } from 'next';
import { ArmadorPedido } from '@/componentes/pedido/armador-pedido';
import { obtenerContenido, obtenerEscalas } from '@/lib/api/consultas';

export const metadata: Metadata = {
  title: 'Mi pedido',
  robots: { index: false },
};

/** Página del pedido: los datos del sitio vienen de la caché y el pedido vive en el navegador. */
export default async function PaginaPedido() {
  const [escalas, contenido] = await Promise.all([obtenerEscalas(), obtenerContenido()]);
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-titulos text-3xl text-texto sm:text-4xl">Mi pedido</h1>
      <p className="mb-8 mt-2 text-texto-suave">
        Combiná productos de cualquier categoría: el precio por unidad baja según el total de unidades.
      </p>
      <ArmadorPedido escalas={escalas} numeroWhatsapp={contenido.contacto.whatsapp} />
    </section>
  );
}
