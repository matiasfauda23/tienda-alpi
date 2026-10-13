import type { Metadata } from 'next';
import Link from 'next/link';
import { ESTILOS_ADMIN } from '@/componentes/admin/comunes';
import { ListaProductosAdmin } from '@/componentes/admin/lista-productos-admin';

export const metadata: Metadata = { title: 'Productos' };

/** Página del panel con el listado de productos. */
export default function PaginaProductosAdmin() {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-titulos text-3xl text-texto">Productos</h1>
        <div className="flex gap-2">
          <Link href="/admin/productos/categorias" className={ESTILOS_ADMIN.botonSecundario}>
            Categorías
          </Link>
          <Link href="/admin/productos/nuevo" className={ESTILOS_ADMIN.botonPrimario}>
            Nuevo producto
          </Link>
        </div>
      </div>
      <ListaProductosAdmin />
    </>
  );
}
