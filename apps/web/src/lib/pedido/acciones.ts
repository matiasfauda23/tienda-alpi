'use server';

import { ErrorDeApi, enviarALaApi } from '../api/cliente';
import { obtenerProducto } from '../api/consultas-productos';
import type { PedidoCalculado, Producto } from '../api/tipos';
import { leerPedidoGuardado, MAXIMO_LINEAS, type LineaPedido } from './lineas';

export type ResultadoVerificacion =
  | { estado: 'ok'; pedido: PedidoCalculado }
  | { estado: 'vacio' }
  | { estado: 'no-disponible' }
  | { estado: 'invalido' }
  | { estado: 'error' };

/** Trae (desde la caché) los productos del pedido; ignora slugs inválidos o inexistentes. */
export async function obtenerProductosDelPedido(slugs: string[]): Promise<Producto[]> {
  const unicos = [...new Set(Array.isArray(slugs) ? slugs : [])]
    .filter((slug): slug is string => typeof slug === 'string')
    .slice(0, MAXIMO_LINEAS);
  const productos = await Promise.all(unicos.map((slug) => obtenerProducto(slug)));
  return productos.filter((producto): producto is Producto => producto !== null);
}

/** Recalcula el pedido en la API con los precios de la base, justo antes de enviarlo. */
export async function verificarPedido(lineas: LineaPedido[]): Promise<ResultadoVerificacion> {
  const validas = leerPedidoGuardado(JSON.stringify(Array.isArray(lineas) ? lineas : []));
  if (validas.length === 0) return { estado: 'vacio' };
  try {
    const items = validas.map(({ varianteId, cantidad }) => ({ varianteId, cantidad }));
    const pedido = await enviarALaApi<PedidoCalculado>('/pedidos/calcular', { items });
    return { estado: 'ok', pedido };
  } catch (error) {
    if (error instanceof ErrorDeApi && error.estado === 404) return { estado: 'no-disponible' };
    if (error instanceof ErrorDeApi && error.estado === 400) return { estado: 'invalido' };
    console.error('No se pudo verificar el pedido', error);
    return { estado: 'error' };
  }
}
