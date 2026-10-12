import Link from 'next/link';
import { Etiqueta } from '@/componentes/ui/etiqueta';
import { IlustracionProducto } from '@/componentes/ui/ilustracion-producto';
import type { Producto } from '@/lib/api/tipos';
import { formatearPrecio } from '@/lib/formato';
import {
  calcularStockTotal,
  obtenerColores,
  obtenerEstadoStock,
  tieneOferta,
  type ColorVariante,
} from '@/lib/productos';

const MAXIMO_COLORES_VISIBLES = 5;

/** Muestra hasta 5 puntitos de color y cuántos colores más hay. */
function PuntosDeColor({ colores }: { colores: ColorVariante[] }) {
  const visibles = colores.slice(0, MAXIMO_COLORES_VISIBLES);
  const restantes = colores.length - visibles.length;
  return (
    <div className="mt-2 flex items-center gap-1.5" aria-label={`${colores.length} colores`}>
      {visibles.map((color) => (
        <span
          key={color.nombre}
          title={color.nombre}
          className="size-3.5 rounded-full border border-borde"
          style={{ backgroundColor: color.hex }}
        />
      ))}
      {restantes > 0 && <span className="text-xs text-texto-suave">+{restantes}</span>}
    </div>
  );
}

/** Tarjeta del catálogo: ilustración, etiquetas, nombre, precio "desde" y colores. */
export function TarjetaProducto({ producto }: { producto: Producto }) {
  const estadoStock = obtenerEstadoStock(calcularStockTotal(producto));
  const colores = obtenerColores(producto);
  return (
    <Link
      href={`/productos/${producto.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-borde bg-superficie transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative">
        <IlustracionProducto categoria={producto.categoria.slug} className="aspect-square w-full" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {tieneOferta(producto) && <Etiqueta tono="oferta">Oferta</Etiqueta>}
          {producto.nuevo && <Etiqueta tono="acento">Nuevo</Etiqueta>}
          {estadoStock === 'ultimas' && <Etiqueta tono="aviso">Últimas unidades</Etiqueta>}
          {estadoStock === 'agotado' && <Etiqueta tono="neutro">Sin stock</Etiqueta>}
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs uppercase tracking-wide text-texto-suave">{producto.categoria.nombre}</p>
        <h3 className="mt-1 font-titulos text-lg leading-snug text-texto group-hover:text-acento-oscuro">
          {producto.nombre}
        </h3>
        <p className="mt-auto pt-3">
          <span className="text-sm text-texto-suave">desde </span>
          <span className="font-semibold text-texto">{formatearPrecio(producto.precioDesde)}</span>
        </p>
        {colores.length > 0 && <PuntosDeColor colores={colores} />}
      </div>
    </Link>
  );
}
