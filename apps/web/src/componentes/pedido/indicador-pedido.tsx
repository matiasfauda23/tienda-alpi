'use client';

import Link from 'next/link';
import { usePedido } from '@/lib/pedido/almacen-pedido';

/** Link "Mi pedido" con la cantidad total de unidades. */
export function IndicadorPedido() {
  const { totalUnidades } = usePedido();
  return (
    <Link
      href="/pedido"
      className="inline-flex items-center gap-2 rounded-full border border-borde bg-superficie px-3 py-1.5 text-sm font-semibold text-texto transition hover:border-acento"
    >
      Mi pedido
      {totalUnidades > 0 && (
        <span className="rounded-full bg-acento px-2 py-0.5 text-xs text-white">{totalUnidades}</span>
      )}
    </Link>
  );
}
