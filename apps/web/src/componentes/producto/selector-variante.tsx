'use client';

import type { EscalaPrecio } from '@tienda-alpi/precios';
import { useState } from 'react';
import { Etiqueta } from '@/componentes/ui/etiqueta';
import type { Producto, Variante } from '@/lib/api/tipos';
import { formatearPrecio } from '@/lib/formato';
import { armarMensajeConsulta } from '@/lib/mensajes';
import { calcularPreciosPorEscala } from '@/lib/precios-producto';
import {
  obtenerColores,
  obtenerEstadoStock,
  obtenerPrecioVigente,
  tieneOfertaVigente,
} from '@/lib/productos';
import { crearEnlaceWhatsApp } from '@/lib/whatsapp';
import { AgregarAlPedido } from './agregar-al-pedido';
import { TablaEscalas } from './tabla-escalas';

type Props = { producto: Producto; escalas: EscalaPrecio[]; numeroWhatsapp: string };

/** Elige la variante inicial: la primera con stock, o la primera si ninguna tiene. */
function elegirVarianteInicial(variantes: Variante[]): Variante {
  return variantes.find((variante) => variante.stock > 0) ?? variantes[0];
}

/** Muestra el precio minorista de la variante, con el precio de lista tachado si hay oferta. */
function BloquePrecio({ variante }: { variante: Variante }) {
  const enOferta = tieneOfertaVigente(variante);
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`font-titulos text-3xl ${enOferta ? 'text-oferta' : 'text-texto'}`}>
        {formatearPrecio(obtenerPrecioVigente(variante))}
      </span>
      {enOferta && <span className="text-lg text-texto-suave line-through">{formatearPrecio(variante.precio)}</span>}
      {enOferta && <Etiqueta tono="oferta">Oferta</Etiqueta>}
      <span className="w-full text-sm text-texto-suave">por unidad, precio minorista</span>
    </div>
  );
}

/** Muestra cuántas unidades hay, o el aviso de últimas unidades o sin stock. */
function EstadoDeStock({ stock }: { stock: number }) {
  const estado = obtenerEstadoStock(stock);
  if (estado === 'agotado') {
    return <p className="text-sm text-texto-suave">Sin stock por ahora. Consultanos por WhatsApp.</p>;
  }
  if (estado === 'ultimas') {
    return (
      <p className="flex items-center gap-2 text-sm text-texto">
        <Etiqueta tono="aviso">Últimas unidades</Etiqueta> Quedan {stock}.
      </p>
    );
  }
  return <p className="text-sm text-texto-suave">{stock} unidades disponibles</p>;
}

/** Selector de variante: al elegir una, actualiza precio, stock, escalas, pedido y mensaje. */
export function SelectorVariante({ producto, escalas, numeroWhatsapp }: Props) {
  const [idSeleccionado, setIdSeleccionado] = useState(() => elegirVarianteInicial(producto.variantes).id);
  const variante = producto.variantes.find((actual) => actual.id === idSeleccionado) ?? producto.variantes[0];
  const colores = new Map(obtenerColores(producto).map((color) => [color.nombre, color.hex]));

  return (
    <div className="flex flex-col gap-6">
      <BloquePrecio variante={variante} />

      {producto.variantes.length > 1 && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-texto">Variante: {variante.nombre}</legend>
          <div className="flex flex-wrap gap-2">
            {producto.variantes.map((opcion) => (
              <button
                key={opcion.id}
                type="button"
                aria-pressed={opcion.id === variante.id}
                onClick={() => setIdSeleccionado(opcion.id)}
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition ${
                  opcion.id === variante.id
                    ? 'border-acento bg-acento-suave text-acento-tinta'
                    : 'border-borde bg-superficie text-texto hover:border-acento'
                } ${opcion.stock === 0 ? 'opacity-60' : ''}`}
              >
                {colores.has(opcion.nombre) && (
                  <span
                    className="size-3.5 rounded-full border border-borde"
                    style={{ backgroundColor: colores.get(opcion.nombre) }}
                  />
                )}
                {opcion.nombre}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <EstadoDeStock stock={variante.stock} />

      <AgregarAlPedido key={variante.id} producto={producto} variante={variante} />

      <TablaEscalas precios={calcularPreciosPorEscala(variante, escalas)} />

      {numeroWhatsapp && (
        <a
          href={crearEnlaceWhatsApp(numeroWhatsapp, armarMensajeConsulta(producto, variante))}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-acento px-6 py-3 text-center font-semibold text-acento-oscuro transition hover:bg-acento-suave"
        >
          Consultar por WhatsApp
        </a>
      )}
    </div>
  );
}
