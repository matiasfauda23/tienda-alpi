import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { CargandoAdmin } from '@/componentes/admin/comunes';
import { EditorProducto } from '@/componentes/admin/producto/editor-producto';

export const metadata: Metadata = { title: 'Editar producto' };

/** Página del panel para editar un producto y sus variantes. */
export default function PaginaEditarProducto({ params }: { params: Promise<{ id: string }> }) {
  return (
    <>
      <Link href="/admin/productos" className="mb-2 inline-block text-sm text-texto-suave hover:text-texto">
        ← Productos
      </Link>
      <Suspense fallback={<CargandoAdmin />}>
        <EditorProducto params={params} />
      </Suspense>
    </>
  );
}

// El panel depende de la sesión del navegador: no se puede validar la navegación instantánea
export const instant = false;
