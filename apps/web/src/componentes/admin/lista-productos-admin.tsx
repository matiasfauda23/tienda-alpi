'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Etiqueta } from '@/componentes/ui/etiqueta';
import type { Producto } from '@/lib/api/tipos';
import { formatearPrecio } from '@/lib/formato';
import { pedirAdmin } from '@/lib/admin/cliente-admin';
import { useAccionAdmin, useDatosAdmin } from '@/lib/admin/datos';
import { filtrarProductosAdmin, type FiltroEstado } from '@/lib/admin/productos-admin';
import { calcularStockTotal, obtenerEstadoStock } from '@/lib/productos';
import { AvisoError, CargandoAdmin, ErrorDeCarga, ESTILOS_ADMIN } from './comunes';

/** Muestra el stock total, resaltando si está bajo o agotado. */
function CeldaStock({ producto }: { producto: Producto }) {
  const stock = calcularStockTotal(producto);
  const estado = obtenerEstadoStock(stock);
  if (estado === 'agotado') return <Etiqueta tono="neutro">Sin stock</Etiqueta>;
  if (estado === 'ultimas') return <Etiqueta tono="aviso">Quedan {stock}</Etiqueta>;
  return <span>{stock}</span>;
}

/** Listado de todos los productos (incluidos los ocultos) con búsqueda y filtro por estado. */
export function ListaProductosAdmin() {
  const { carga, recargar, reemplazar } = useDatosAdmin<Producto[]>('/admin/productos');
  const { ejecutar, enCurso, error } = useAccionAdmin();
  const [texto, setTexto] = useState('');
  const [estado, setEstado] = useState<FiltroEstado>('todos');

  if (carga.estado === 'cargando') return <CargandoAdmin />;
  if (carga.estado === 'error') return <ErrorDeCarga mensaje={carga.mensaje} alReintentar={recargar} />;

  const productos = carga.datos;
  const visibles = filtrarProductosAdmin(productos, texto, estado);

  /** Muestra u oculta un producto en la tienda y actualiza su fila con la respuesta de la API. */
  async function alternarActivo(producto: Producto) {
    const resultado = await ejecutar(() =>
      pedirAdmin<Producto>(`/admin/productos/${producto.id}`, {
        metodo: 'PATCH',
        cuerpo: { activo: !producto.activo },
      }),
    );
    if (resultado.ok) {
      reemplazar(productos.map((actual) => (actual.id === producto.id ? resultado.valor : actual)));
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={texto}
          onChange={(evento) => setTexto(evento.target.value)}
          placeholder="Buscar por nombre, categoría o SKU"
          aria-label="Buscar productos"
          className={`${ESTILOS_ADMIN.campo} max-w-sm`}
        />
        <select
          value={estado}
          onChange={(evento) => setEstado(evento.target.value as FiltroEstado)}
          aria-label="Filtrar por estado"
          className={`${ESTILOS_ADMIN.campo} w-auto`}
        >
          <option value="todos">Todos ({productos.length})</option>
          <option value="activos">Visibles en la tienda</option>
          <option value="ocultos">Ocultos</option>
        </select>
      </div>

      <AvisoError mensaje={error} />

      {visibles.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-borde p-8 text-center text-texto-suave">
          No hay productos que coincidan.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-borde bg-superficie">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-borde text-left text-texto-suave">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">Producto</th>
                <th scope="col" className="px-4 py-3 font-medium">Variantes</th>
                <th scope="col" className="px-4 py-3 font-medium">Desde</th>
                <th scope="col" className="px-4 py-3 font-medium">Stock</th>
                <th scope="col" className="px-4 py-3 font-medium">En la tienda</th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((producto) => (
                <tr key={producto.id} className="border-b border-borde last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/productos/${producto.id}`}
                      className="font-semibold text-texto hover:text-acento-oscuro"
                    >
                      {producto.nombre}
                    </Link>
                    <p className="text-xs text-texto-suave">
                      {producto.categoria.nombre}
                      {producto.destacado && ' · Destacado'}
                      {producto.nuevo && ' · Nuevo'}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-texto-suave">{producto.variantes.length}</td>
                  <td className="px-4 py-3">{formatearPrecio(producto.precioDesde)}</td>
                  <td className="px-4 py-3">
                    <CeldaStock producto={producto} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Etiqueta tono={producto.activo ? 'acento' : 'neutro'}>
                        {producto.activo ? 'Visible' : 'Oculto'}
                      </Etiqueta>
                      <button
                        type="button"
                        disabled={enCurso}
                        onClick={() => alternarActivo(producto)}
                        className="text-xs font-semibold text-texto-suave underline hover:text-texto disabled:opacity-50"
                      >
                        {producto.activo ? 'Ocultar' : 'Mostrar'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
