import type { Metadata } from 'next';
import { EditorEscalas } from '@/componentes/admin/editor-escalas';

export const metadata: Metadata = { title: 'Escalas' };

/** Página del panel para configurar los precios por cantidad. */
export default function PaginaEscalasAdmin() {
  return (
    <>
      <h1 className="font-titulos text-3xl text-texto">Escalas de precio</h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm text-texto-suave">
        Las unidades se cuentan sumando todos los productos del pedido. La primera escala es el precio normal. Los
        precios fijos que cargues en cada variante tienen prioridad sobre el porcentaje.
      </p>
      <EditorEscalas />
    </>
  );
}

// El panel depende de la sesión del navegador: no se puede validar la navegación instantánea
export const instant = false;
