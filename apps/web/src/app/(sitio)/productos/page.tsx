import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { Paginacion } from '@/componentes/catalogo/paginacion';
import { PanelFiltros } from '@/componentes/catalogo/panel-filtros';
import { TarjetaProducto } from '@/componentes/catalogo/tarjeta-producto';
import { obtenerCategorias } from '@/lib/api/consultas';
import { obtenerProductos } from '@/lib/api/consultas-productos';
import { leerFiltrosCatalogo, type ParametrosUrl } from '@/lib/catalogo';

export const metadata: Metadata = {
  title: 'Productos',
  description: 'Mates térmicos, termos, vasos y bombillas. Precios por mayor y por menor.',
};

type Props = { searchParams: Promise<ParametrosUrl> };

/** Arma el texto "1 producto" / "N productos". */
function describirCantidad(total: number): string {
  return total === 1 ? '1 producto' : `${total} productos`;
}

/** Mensaje cuando los filtros no devuelven productos. */
function SinResultados() {
  return (
    <div className="rounded-2xl border border-dashed border-borde p-10 text-center">
      <p className="font-titulos text-xl text-texto">No encontramos productos</p>
      <p className="mt-2 text-sm text-texto-suave">Probá con otros filtros o mirá todo el catálogo.</p>
      <Link href="/productos" className="mt-4 inline-block text-sm font-semibold text-acento-oscuro underline">
        Ver todos los productos
      </Link>
    </div>
  );
}

/** Esqueleto que se ve mientras llegan los productos. */
function CargandoCatalogo() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3" aria-busy="true">
      {Array.from({ length: 6 }, (_, indice) => (
        <div key={indice} className="aspect-[3/4] animate-pulse rounded-2xl bg-borde/60" />
      ))}
    </div>
  );
}

/** Lee los filtros de la URL, pide productos y categorías y arma la grilla. */
async function Catalogo({ searchParams }: Props) {
  const filtros = leerFiltrosCatalogo(await searchParams);
  const [resultado, categorias] = await Promise.all([obtenerProductos(filtros), obtenerCategorias()]);
  return (
    <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
      <aside>
        <PanelFiltros key={JSON.stringify(filtros)} filtros={filtros} categorias={categorias} />
      </aside>
      <div>
        <p className="mb-4 text-sm text-texto-suave">{describirCantidad(resultado.total)}</p>
        {resultado.items.length === 0 ? (
          <SinResultados />
        ) : (
          <ul className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3">
            {resultado.items.map((producto) => (
              <li key={producto.id}>
                <TarjetaProducto producto={producto} />
              </li>
            ))}
          </ul>
        )}
        <Paginacion filtros={filtros} totalPaginas={resultado.totalPaginas} />
      </div>
    </div>
  );
}

/** Página del catálogo: el título es estático y el listado depende de la URL. */
export default function PaginaProductos({ searchParams }: Props) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-titulos text-3xl text-texto sm:text-4xl">Productos</h1>
      <Suspense fallback={<CargandoCatalogo />}>
        <Catalogo searchParams={searchParams} />
      </Suspense>
    </section>
  );
}
