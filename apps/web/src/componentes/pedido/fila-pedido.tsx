'use client';

import Link from 'next/link';
import { ControlCantidad } from '@/componentes/ui/control-cantidad';
import { formatearPrecio } from '@/lib/formato';
import type { LineaResumen } from '@/lib/pedido/resumen';

type Props = {
  linea: LineaResumen;
  alCambiarCantidad: (cantidad: number) => void;
  alQuitar: () => void;
};

/** Una fila del pedido: producto, variante, precio por unidad, cantidad y subtotal. */
export function FilaPedido({ linea, alCambiarCantidad, alQuitar }: Props) {
  const { producto, variante } = linea;
  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-borde bg-superficie p-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <Link
          href={`/productos/${producto.slug}`}
          className="font-titulos text-lg text-texto hover:text-acento-oscuro"
        >
          {producto.nombre}
        </Link>
        <p className="text-sm text-texto-suave">
          {variante.nombre} · {formatearPrecio(linea.precioUnitario)} c/u
        </p>
        {linea.superaStock && (
          <p className="mt-1 text-sm text-oferta">
            Hay {variante.stock} en stock: te confirmamos disponibilidad por WhatsApp.
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-4 sm:justify-end">
        <ControlCantidad
          cantidad={linea.cantidad}
          etiqueta={`Cantidad de ${producto.nombre} ${variante.nombre}`}
          alCambiar={alCambiarCantidad}
        />
        <p className="w-28 text-right font-semibold text-texto">{formatearPrecio(linea.subtotal)}</p>
        <button
          type="button"
          onClick={alQuitar}
          className="text-sm text-texto-suave underline hover:text-oferta"
        >
          Quitar
        </button>
      </div>
    </li>
  );
}
