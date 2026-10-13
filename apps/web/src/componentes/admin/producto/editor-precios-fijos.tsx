'use client';

import { aplicarDescuento, ordenarEscalas, type EscalaPrecio } from '@tienda-alpi/precios';
import { useState } from 'react';
import type { Producto, Variante } from '@/lib/api/tipos';
import { formatearPrecio } from '@/lib/formato';
import { calcularPreciosPorEscala, describirRango } from '@/lib/precios-producto';
import { pedirAdmin } from '@/lib/admin/cliente-admin';
import { useAccionAdmin, useDatosAdmin } from '@/lib/admin/datos';
import { soloDigitos } from '@/lib/admin/formulario-producto';
import {
  convertirBorradorPreciosFijos,
  crearBorradorPreciosFijos,
  sonDistintosPreciosFijos,
  validarBorradorPreciosFijos,
} from '@/lib/admin/precios-fijos';
import { AvisoError, CargandoAdmin, ErrorDeCarga, ESTILOS_ADMIN } from '../comunes';

type Props = { producto: Producto; variante: Variante; alCambiar: (producto: Producto) => void };

/** Tabla para poner precios redondos por escala; vacío = se usa el porcentaje de la escala. */
export function EditorPreciosFijos({ producto, variante, alCambiar }: Props) {
  const { carga, recargar } = useDatosAdmin<EscalaPrecio[]>('/escalas');
  const [borrador, setBorrador] = useState(() => crearBorradorPreciosFijos(variante));
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const { ejecutar, enCurso, error } = useAccionAdmin();

  if (carga.estado === 'cargando') return <CargandoAdmin />;
  if (carga.estado === 'error') return <ErrorDeCarga mensaje={carga.mensaje} alReintentar={recargar} />;

  const escalas = ordenarEscalas(carga.datos);
  const errores = validarBorradorPreciosFijos(borrador);
  const precios = convertirBorradorPreciosFijos(borrador, escalas);
  const vistaPrevia = calcularPreciosPorEscala({ ...variante, preciosFijos: precios }, escalas);
  const hayCambios = sonDistintosPreciosFijos(variante.preciosFijos, precios);

  /** Cambia el precio fijo de una escala (solo dígitos). */
  function cambiar(escalaId: string, texto: string) {
    setBorrador({ ...borrador, [escalaId]: soloDigitos(texto) });
    setGuardado(false);
  }

  /** Valida y reemplaza todos los precios fijos de la variante. */
  async function guardar() {
    setMostrarErrores(true);
    if (Object.keys(errores).length > 0) return;
    const resultado = await ejecutar(() =>
      pedirAdmin<Producto>(`/admin/productos/${producto.id}/variantes/${variante.id}/precios-fijos`, {
        metodo: 'PUT',
        cuerpo: { precios },
      }),
    );
    if (resultado.ok) {
      alCambiar(resultado.valor);
      setMostrarErrores(false);
      setGuardado(true);
    }
  }

  return (
    <div className="mt-4 rounded-xl border border-borde bg-fondo p-4">
      <p className="mb-3 text-sm text-texto-suave">
        Dejá vacío para usar el porcentaje de la escala. Se calcula sobre el precio guardado (
        {formatearPrecio(variante.precio)}); si cambiaste el precio arriba, guardá la variante primero.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-texto-suave">
            <tr>
              <th scope="col" className="py-2 pr-3 font-medium">Escala</th>
              <th scope="col" className="py-2 pr-3 font-medium">Unidades</th>
              <th scope="col" className="py-2 pr-3 font-medium">Con %</th>
              <th scope="col" className="py-2 pr-3 font-medium">Precio fijo</th>
              <th scope="col" className="py-2 font-medium">Precio final</th>
            </tr>
          </thead>
          <tbody>
            {vistaPrevia.map(({ escala, cantidadMaxima, precioUnitario }) => (
              <tr key={escala.id} className="border-t border-borde">
                <th scope="row" className="py-2 pr-3 text-left font-semibold text-texto">
                  {escala.nombre}
                </th>
                <td className="py-2 pr-3 text-texto-suave">{describirRango(escala.cantidadMinima, cantidadMaxima)}</td>
                <td className="py-2 pr-3 text-texto-suave">
                  {formatearPrecio(aplicarDescuento(variante.precio, escala.porcentajeDescuento))}
                  {escala.porcentajeDescuento > 0 && ` (-${escala.porcentajeDescuento}%)`}
                </td>
                <td className="py-2 pr-3">
                  <input
                    inputMode="numeric"
                    value={borrador[escala.id] ?? ''}
                    onChange={(evento) => cambiar(escala.id, evento.target.value)}
                    placeholder="Usar %"
                    aria-label={`Precio fijo para ${escala.nombre}`}
                    aria-invalid={mostrarErrores && Boolean(errores[escala.id])}
                    className={`${ESTILOS_ADMIN.campo} w-32`}
                  />
                  {mostrarErrores && errores[escala.id] && (
                    <span className="block text-xs text-oferta">{errores[escala.id]}</span>
                  )}
                </td>
                <td className="py-2 font-semibold text-texto">{formatearPrecio(precioUnitario)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {variante.precioOferta !== null && (
        <p className="mt-2 text-xs text-texto-suave">
          Esta variante tiene oferta ({formatearPrecio(variante.precioOferta)}): si es más barata, se usa la oferta.
        </p>
      )}
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button type="button" onClick={guardar} disabled={!hayCambios || enCurso} className={ESTILOS_ADMIN.botonPrimario}>
          Guardar precios
        </button>
        {Object.values(borrador).some((texto) => texto !== '') && (
          <button type="button" onClick={() => setBorrador({})} className={ESTILOS_ADMIN.botonPeligro}>
            Quitar todos (usar solo %)
          </button>
        )}
        {guardado && (
          <p role="status" className="text-sm text-acento-oscuro">
            Precios guardados.
          </p>
        )}
      </div>
      <AvisoError mensaje={error} />
    </div>
  );
}
