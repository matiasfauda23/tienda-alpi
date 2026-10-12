'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ControlCantidad } from '@/componentes/ui/control-cantidad';
import type { Producto, Variante } from '@/lib/api/tipos';
import { usePedido } from '@/lib/pedido/almacen-pedido';
import { normalizarCantidad } from '@/lib/pedido/lineas';

type Props = { producto: Producto; variante: Variante };

/** Elige cuántas unidades sumar al pedido y muestra una confirmación. */
export function AgregarAlPedido({ producto, variante }: Props) {
  const { agregar } = usePedido();
  const [cantidad, setCantidad] = useState(1);
  const [agregadas, setAgregadas] = useState<number | null>(null);

  if (variante.stock <= 0) return null;

  /** Suma la cantidad elegida al pedido y deja visible la confirmación. */
  function alAgregar() {
    agregar({ varianteId: variante.id, productoSlug: producto.slug }, cantidad);
    setAgregadas(cantidad);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <ControlCantidad
          cantidad={cantidad}
          etiqueta="Cantidad a agregar"
          alCambiar={(nueva) => setCantidad(Math.max(1, normalizarCantidad(nueva)))}
        />
        <button
          type="button"
          onClick={alAgregar}
          className="flex-1 rounded-full bg-acento px-6 py-3 font-semibold text-white transition hover:bg-acento-oscuro"
        >
          Agregar al pedido
        </button>
      </div>
      <p aria-live="polite" className="min-h-5 text-sm text-acento-oscuro">
        {agregadas !== null && (
          <>
            Agregaste {agregadas} {agregadas === 1 ? 'unidad' : 'unidades'}.{' '}
            <Link href="/pedido" className="font-semibold underline">
              Ver pedido
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
