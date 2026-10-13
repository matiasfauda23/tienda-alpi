import type { Metadata } from 'next';
import Link from 'next/link';
import { FormularioNuevoProducto } from '@/componentes/admin/producto/formulario-nuevo-producto';

export const metadata: Metadata = { title: 'Nuevo producto' };

/** Página del panel para crear un producto. */
export default function PaginaNuevoProducto() {
  return (
    <>
      <Link href="/admin/productos" className="text-sm text-texto-suave hover:text-texto">
        ← Productos
      </Link>
      <h1 className="mb-6 mt-2 font-titulos text-3xl text-texto">Nuevo producto</h1>
      <FormularioNuevoProducto />
    </>
  );
}

// El panel depende de la sesión del navegador: no se puede validar la navegación instantánea
export const instant = false;
