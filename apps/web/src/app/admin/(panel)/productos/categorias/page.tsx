import type { Metadata } from 'next';
import Link from 'next/link';
import { GestorCategorias } from '@/componentes/admin/gestor-categorias';

export const metadata: Metadata = { title: 'Categorías' };

/** Página del panel para administrar las categorías. */
export default function PaginaCategoriasAdmin() {
  return (
    <>
      <Link href="/admin/productos" className="text-sm text-texto-suave hover:text-texto">
        ← Productos
      </Link>
      <h1 className="mb-2 mt-2 font-titulos text-3xl text-texto">Categorías</h1>
      <p className="mb-6 text-sm text-texto-suave">
        El orden define cómo aparecen en la tienda. Una categoría oculta no se muestra en los filtros.
      </p>
      <GestorCategorias />
    </>
  );
}

// El panel depende de la sesión del navegador: no se puede validar la navegación instantánea
export const instant = false;
