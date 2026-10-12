import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SelectorVariante } from '@/componentes/producto/selector-variante';
import { Etiqueta } from '@/componentes/ui/etiqueta';
import { IlustracionProducto } from '@/componentes/ui/ilustracion-producto';
import { obtenerContenido, obtenerEscalas } from '@/lib/api/consultas';
import { obtenerProducto } from '@/lib/api/consultas-productos';

type Props = { params: Promise<{ slug: string }> };

/** Título y descripción de la pestaña según el producto. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const producto = await obtenerProducto(slug);
  if (!producto) return { title: 'Producto no encontrado' };
  return {
    title: producto.nombre,
    description: producto.descripcion || `${producto.nombre}, ${producto.categoria.nombre.toLowerCase()} en Tienda Alpi.`,
  };
}

/** Esqueleto que se ve mientras llega el producto. */
function CargandoProducto() {
  return (
    <div className="grid gap-10 md:grid-cols-2" aria-busy="true">
      <div className="aspect-square animate-pulse rounded-3xl bg-borde/60" />
      <div className="flex flex-col gap-4">
        <div className="h-10 w-3/4 animate-pulse rounded-lg bg-borde/60" />
        <div className="h-64 animate-pulse rounded-2xl bg-borde/60" />
      </div>
    </div>
  );
}

/** Busca el producto por slug y arma el detalle; si no existe, muestra la página 404. */
async function DetalleProducto({ params }: Props) {
  const { slug } = await params;
  const [producto, escalas, contenido] = await Promise.all([
    obtenerProducto(slug),
    obtenerEscalas(),
    obtenerContenido(),
  ]);
  if (!producto) notFound();

  return (
    <>
      <nav aria-label="Migas de pan" className="mb-6 text-sm text-texto-suave">
        <Link href="/" className="hover:text-texto">Inicio</Link>
        <span className="mx-2">›</span>
        <Link href="/productos" className="hover:text-texto">Productos</Link>
        <span className="mx-2">›</span>
        <Link href={`/productos?categoria=${producto.categoria.slug}`} className="hover:text-texto">
          {producto.categoria.nombre}
        </Link>
      </nav>

      <div className="grid gap-10 md:grid-cols-2">
        <IlustracionProducto
          categoria={producto.categoria.slug}
          className="aspect-square w-full overflow-hidden rounded-3xl border border-borde"
        />

        <div className="flex flex-col gap-6">
          <div>
            <p className="text-xs uppercase tracking-wide text-texto-suave">{producto.categoria.nombre}</p>
            <h1 className="mt-1 font-titulos text-3xl text-texto sm:text-4xl">{producto.nombre}</h1>
            {producto.nuevo && <div className="mt-3"><Etiqueta tono="acento">Nuevo</Etiqueta></div>}
            {producto.descripcion && (
              <p className="mt-4 whitespace-pre-line text-texto-suave">{producto.descripcion}</p>
            )}
          </div>

          {producto.variantes.length > 0 ? (
            <SelectorVariante
              producto={producto}
              escalas={escalas}
              numeroWhatsapp={contenido.contacto.whatsapp}
            />
          ) : (
            <p className="text-texto-suave">Este producto no tiene variantes disponibles por ahora.</p>
          )}
        </div>
      </div>
    </>
  );
}

/** Página de detalle de un producto. */
export default function PaginaProducto({ params }: Props) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Suspense fallback={<CargandoProducto />}>
        <DetalleProducto params={params} />
      </Suspense>
    </section>
  );
}
