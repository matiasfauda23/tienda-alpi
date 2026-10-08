import Link from 'next/link';
import type { Banner } from '@/lib/api/tipos';
import { IlustracionProducto } from '../ui/ilustracion-producto';

/** Textos que se muestran si Marce no cargó un banner o lo dejó oculto. */
const TEXTOS_POR_DEFECTO = {
  titulo: 'Mates térmicos, vasos y bombillas, directo de fábrica.',
  subtitulo:
    'Cuanto más llevás, menos pagás por unidad. Armá tu pedido combinando productos y colores, mirá el precio al instante y consultalo por WhatsApp.',
};

/** Portada del inicio: título, subtítulo y accesos principales. */
export function Portada({ banner }: { banner: Banner }) {
  const usarBanner = banner.visible && banner.titulo;
  const titulo = usarBanner ? banner.titulo : TEXTOS_POR_DEFECTO.titulo;
  const subtitulo = usarBanner ? banner.subtitulo : TEXTOS_POR_DEFECTO.subtitulo;

  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 md:grid-cols-2 md:py-20">
      <div className="flex flex-col gap-6">
        <p className="text-[13px] font-semibold tracking-widest text-acento uppercase">
          Fabricantes · Mayorista y minorista
        </p>
        <h1 className="font-titulos text-4xl leading-tight font-medium sm:text-5xl">{titulo}</h1>
        {subtitulo && <p className="max-w-lg text-lg text-texto-suave">{subtitulo}</p>}

        <div className="flex flex-wrap gap-3 pt-2">
          <Link href="/productos" className="inline-flex h-12 items-center rounded-full bg-acento px-7 font-semibold text-white hover:bg-acento-oscuro">
            Ver productos
          </Link>
          <Link href="/#precios" className="inline-flex h-12 items-center rounded-full border border-texto px-7 font-semibold hover:bg-superficie">
            Cómo funcionan los precios
          </Link>
        </div>
      </div>

      {/* Mientras no haya fotos, una composición con los dibujos de los productos */}
      <div className="grid grid-cols-2 gap-4" aria-hidden="true">
        <IlustracionProducto categoria="mates" className="aspect-square rounded-3xl" />
        <IlustracionProducto categoria="termos" className="aspect-square rounded-3xl" />
        <IlustracionProducto categoria="vasos" className="aspect-square rounded-3xl" />
        <IlustracionProducto categoria="bombillas" className="aspect-square rounded-3xl" />
      </div>
    </section>
  );
}
