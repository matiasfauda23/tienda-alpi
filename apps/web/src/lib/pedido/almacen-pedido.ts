'use client';

import { useSyncExternalStore } from 'react';
import {
  agregarAlPedido,
  cambiarCantidad,
  contarUnidades,
  leerPedidoGuardado,
  quitarDelPedido,
  type LineaPedido,
  type ReferenciaVariante,
} from './lineas';

const CLAVE_ALMACENAMIENTO = 'alpi-pedido';
const EVENTO_CAMBIO = 'alpi-pedido-cambio';
const PEDIDO_VACIO: LineaPedido[] = [];

let lineasActuales: LineaPedido[] | null = null;

/** Lee el pedido guardado; si el navegador bloquea el almacenamiento, empieza vacío. */
function leerDelNavegador(): LineaPedido[] {
  try {
    return leerPedidoGuardado(localStorage.getItem(CLAVE_ALMACENAMIENTO));
  } catch {
    return PEDIDO_VACIO;
  }
}

/** Devuelve el pedido actual (siempre el mismo arreglo mientras no cambie). */
function obtenerLineas(): LineaPedido[] {
  lineasActuales ??= leerDelNavegador();
  return lineasActuales;
}

/** En el servidor no existe el pedido del cliente: siempre vacío. */
function obtenerLineasEnServidor(): LineaPedido[] {
  return PEDIDO_VACIO;
}

/** Guarda el pedido en memoria y en el navegador, y avisa a los componentes. */
function guardar(lineas: LineaPedido[]): void {
  lineasActuales = lineas;
  try {
    localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(lineas));
  } catch {
    // Sin almacenamiento (modo privado estricto): el pedido vive solo mientras la pestaña esté abierta.
  }
  window.dispatchEvent(new Event(EVENTO_CAMBIO));
}

/** Escucha cambios del pedido en esta pestaña y en otras pestañas del mismo sitio. */
function suscribirse(avisar: () => void): () => void {
  const alCambiarEnOtraPestana = (evento: StorageEvent) => {
    if (evento.key !== CLAVE_ALMACENAMIENTO) return;
    lineasActuales = leerPedidoGuardado(evento.newValue);
    avisar();
  };
  window.addEventListener(EVENTO_CAMBIO, avisar);
  window.addEventListener('storage', alCambiarEnOtraPestana);
  return () => {
    window.removeEventListener(EVENTO_CAMBIO, avisar);
    window.removeEventListener('storage', alCambiarEnOtraPestana);
  };
}

/** No hay nada que escuchar: solo se usa para distinguir servidor de navegador. */
function suscribirseANada(): () => void {
  return () => {};
}

/** Devuelve false en el servidor y durante la hidratación; true una vez en el navegador. */
export function useEnNavegador(): boolean {
  return useSyncExternalStore(suscribirseANada, () => true, () => false);
}

/** Hook con el pedido actual y las acciones para modificarlo. */
export function usePedido() {
  const lineas = useSyncExternalStore(suscribirse, obtenerLineas, obtenerLineasEnServidor);
  return {
    lineas,
    totalUnidades: contarUnidades(lineas),
    agregar: (referencia: ReferenciaVariante, cantidad: number) =>
      guardar(agregarAlPedido(obtenerLineas(), referencia, cantidad)),
    cambiarCantidad: (varianteId: string, cantidad: number) =>
      guardar(cambiarCantidad(obtenerLineas(), varianteId, cantidad)),
    quitar: (varianteId: string) => guardar(quitarDelPedido(obtenerLineas(), varianteId)),
    vaciar: () => guardar(PEDIDO_VACIO),
  };
}
