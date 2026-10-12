'use client';

import type { EscalaPrecio } from '@tienda-alpi/precios';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import type { Producto } from '@/lib/api/tipos';
import { obtenerProductosDelPedido, verificarPedido, type ResultadoVerificacion } from '@/lib/pedido/acciones';
import { useEnNavegador, usePedido } from '@/lib/pedido/almacen-pedido';
import { obtenerSlugsDelPedido } from '@/lib/pedido/lineas';
import { armarMensajePedido } from '@/lib/pedido/mensaje-pedido';
import { armarResumenPedido } from '@/lib/pedido/resumen';
import { crearEnlaceWhatsApp } from '@/lib/whatsapp';
import { FilaPedido } from './fila-pedido';
import { ResumenDelPedido } from './resumen-pedido';

type Props = { escalas: EscalaPrecio[]; numeroWhatsapp: string };
type ProductosCargados = { clave: string; productos: Producto[] };

const MENSAJES_ERROR: Record<Exclude<ResultadoVerificacion['estado'], 'ok'>, string> = {
  vacio: 'Tu pedido está vacío.',
  'no-disponible': 'Algún producto del pedido ya no está disponible. Quitalo y volvé a intentar.',
  invalido: 'Revisá las cantidades del pedido y volvé a intentar.',
  error: 'No pudimos preparar el pedido. Probá de nuevo en un momento.',
};

/** Esqueleto mientras se lee el pedido o se cargan los productos. */
function CargandoPedido() {
  return <div className="h-48 animate-pulse rounded-2xl bg-borde/60" aria-busy="true" />;
}

/** Mensaje cuando el pedido no tiene productos. */
function PedidoVacio() {
  return (
    <div className="rounded-2xl border border-dashed border-borde p-10 text-center">
      <p className="font-titulos text-xl text-texto">Tu pedido está vacío</p>
      <p className="mt-2 text-sm text-texto-suave">Sumá productos desde el catálogo.</p>
      <Link href="/productos" className="mt-4 inline-block font-semibold text-acento-oscuro underline">
        Ver productos
      </Link>
    </div>
  );
}

/** Pantalla del pedido: carga productos, calcula en el navegador y envía por WhatsApp. */
export function ArmadorPedido({ escalas, numeroWhatsapp }: Props) {
  const enNavegador = useEnNavegador();
  const { lineas, cambiarCantidad, quitar, vaciar } = usePedido();
  const clave = obtenerSlugsDelPedido(lineas).join(',');
  const [cargados, setCargados] = useState<ProductosCargados | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clave) return;
    let vigente = true;
    obtenerProductosDelPedido(clave.split(','))
      .then((productos) => {
        if (vigente) setCargados({ clave, productos });
      })
      .catch(() => {
        if (vigente) setError(MENSAJES_ERROR.error);
      });
    return () => {
      vigente = false;
    };
  }, [clave]);

  const cargando = cargados?.clave !== clave;
  const resumen = useMemo(
    () => (cargados && !cargando ? armarResumenPedido(lineas, cargados.productos, escalas) : null),
    [cargados, cargando, lineas, escalas],
  );

  /** Verifica el pedido con la API (precios reales) y abre WhatsApp con el detalle. */
  async function enviarPedido() {
    setEnviando(true);
    setError(null);
    try {
      const resultado = await verificarPedido(lineas);
      if (resultado.estado !== 'ok') {
        setError(MENSAJES_ERROR[resultado.estado]);
        return;
      }
      window.location.href = crearEnlaceWhatsApp(numeroWhatsapp, armarMensajePedido(resultado.pedido));
    } catch {
      setError(MENSAJES_ERROR.error);
    } finally {
      setEnviando(false);
    }
  }

  /** Pide confirmación antes de vaciar el pedido. */
  function confirmarVaciado() {
    if (window.confirm('¿Querés vaciar todo el pedido?')) vaciar();
  }

  if (!enNavegador) return <CargandoPedido />;
  if (lineas.length === 0) return <PedidoVacio />;
  if (cargando && error) return <p role="alert" className="text-oferta">{error}</p>;
  if (cargando) return <CargandoPedido />;
  if (!resumen) {
    return <p className="text-texto-suave">Los precios por cantidad todavía no están configurados.</p>;
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-4">
        {resumen.noDisponibles.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-oferta/40 p-4 text-sm text-oferta">
            Algunos productos de tu pedido ya no están disponibles.
            <button
              type="button"
              onClick={() => resumen.noDisponibles.forEach(quitar)}
              className="font-semibold underline"
            >
              Quitarlos
            </button>
          </div>
        )}
        <ul className="flex flex-col gap-3">
          {resumen.lineas.map((linea) => (
            <FilaPedido
              key={linea.variante.id}
              linea={linea}
              alCambiarCantidad={(cantidad) => cambiarCantidad(linea.variante.id, cantidad)}
              alQuitar={() => quitar(linea.variante.id)}
            />
          ))}
        </ul>
        <Link href="/productos" className="text-sm font-semibold text-acento-oscuro underline">
          ← Seguir sumando productos
        </Link>
      </div>
      <ResumenDelPedido
        resumen={resumen}
        puedeEnviar={numeroWhatsapp !== ''}
        enviando={enviando}
        error={error}
        alEnviar={enviarPedido}
        alVaciar={confirmarVaciado}
      />
    </div>
  );
}
