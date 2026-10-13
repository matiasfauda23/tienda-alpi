'use client';

import { useState, type ChangeEvent } from 'react';
import { formatearPrecio } from '@/lib/formato';
import { descargarAdmin, pedirAdmin } from '@/lib/admin/cliente-admin';
import { useAccionAdmin } from '@/lib/admin/datos';
import { guardarArchivo } from '@/lib/admin/descargas';
import { armarNombreDescarga, camposModificados, validarArchivoPlanilla } from '@/lib/admin/planillas-admin';
import type {
  CambioVariante,
  ComparacionPlanilla,
  ErrorDeFila,
  ResultadoImportacion,
  ValoresVariante,
} from '@/lib/admin/tipos';
import { AvisoError, ESTILOS_ADMIN } from '../comunes';
import { ESTILO_TARJETA } from '../producto/campo';

type Etapa =
  | { tipo: 'elegir' }
  | { tipo: 'revisar'; archivo: File; comparacion: ComparacionPlanilla }
  | { tipo: 'aplicada'; resultado: ResultadoImportacion };

/** Muestra un precio de oferta, o una raya si no tiene. */
function describirOferta(precio: number | null): string {
  return precio === null ? '—' : formatearPrecio(precio);
}

/** Paso 1: descargar la planilla actual. */
function SeccionDescarga() {
  const { ejecutar, enCurso, error } = useAccionAdmin();

  /** Pide la planilla a la API y la guarda en la computadora. */
  async function descargar() {
    const resultado = await ejecutar(() => descargarAdmin('/admin/planillas/exportar'));
    if (resultado.ok) guardarArchivo(resultado.valor, armarNombreDescarga(new Date()));
  }

  return (
    <section className={ESTILO_TARJETA}>
      <h2 className="font-titulos text-xl text-texto">1. Descargar la planilla</h2>
      <p className="mt-2 text-sm text-texto-suave">
        Trae todas las variantes con sus precios y stock. Modificá solo las columnas <strong>Precio</strong>,{' '}
        <strong>Precio oferta</strong> y <strong>Stock</strong>. No cambies el <strong>SKU</strong>: es lo que identifica
        cada variante. Para quitar una oferta, dejá la celda vacía.
      </p>
      <button type="button" onClick={descargar} disabled={enCurso} className={`mt-4 ${ESTILOS_ADMIN.botonSecundario}`}>
        {enCurso ? 'Preparando…' : 'Descargar planilla (.xlsx)'}
      </button>
      <AvisoError mensaje={error} />
    </section>
  );
}

/** Lista de errores por fila: mientras haya alguno, no se puede aplicar nada. */
function TablaErrores({ errores }: { errores: ErrorDeFila[] }) {
  return (
    <div className="rounded-xl border border-oferta/40 p-4">
      <p className="font-semibold text-oferta">
        La planilla tiene {errores.length} {errores.length === 1 ? 'error' : 'errores'}. Corregilos en el Excel y
        volvé a subirla: no se aplica ningún cambio mientras haya errores.
      </p>
      <ul className="mt-3 flex flex-col gap-1 text-sm">
        {errores.map((error) => (
          <li key={`${error.fila}-${error.sku}`}>
            <strong>Fila {error.fila}</strong>
            {error.sku && ` (${error.sku})`}: {error.mensaje}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Celda "antes → después" resaltada si el valor cambia. */
function CeldaCambio({ cambio, campo }: { cambio: CambioVariante; campo: keyof ValoresVariante }) {
  const formatear = (valores: ValoresVariante) =>
    campo === 'stock' ? String(valores.stock) : campo === 'precio' ? formatearPrecio(valores.precio) : describirOferta(valores.precioOferta);
  if (!camposModificados(cambio).includes(campo)) {
    return <td className="px-3 py-2 text-texto-suave">{formatear(cambio.despues)}</td>;
  }
  return (
    <td className="px-3 py-2">
      <span className="text-texto-suave line-through">{formatear(cambio.antes)}</span>{' '}
      <span className="font-semibold text-acento-oscuro">→ {formatear(cambio.despues)}</span>
    </td>
  );
}

/** Tabla con los cambios que se aplicarían. */
function TablaCambios({ cambios }: { cambios: CambioVariante[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-borde">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-borde text-left text-texto-suave">
          <tr>
            <th scope="col" className="px-3 py-2 font-medium">Variante</th>
            <th scope="col" className="px-3 py-2 font-medium">Precio</th>
            <th scope="col" className="px-3 py-2 font-medium">Oferta</th>
            <th scope="col" className="px-3 py-2 font-medium">Stock</th>
          </tr>
        </thead>
        <tbody>
          {cambios.map((cambio) => (
            <tr key={cambio.varianteId} className="border-b border-borde last:border-0">
              <td className="px-3 py-2">
                <span className="font-semibold text-texto">{cambio.producto}</span>
                <span className="block text-xs text-texto-suave">
                  {cambio.variante} · {cambio.sku}
                </span>
              </td>
              <CeldaCambio cambio={cambio} campo="precio" />
              <CeldaCambio cambio={cambio} campo="precioOferta" />
              <CeldaCambio cambio={cambio} campo="stock" />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Paso 2 y 3: subir la planilla, revisar la vista previa y aplicar. */
function SeccionSubida() {
  const [etapa, setEtapa] = useState<Etapa>({ tipo: 'elegir' });
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [claveInput, setClaveInput] = useState(0);
  const { ejecutar, enCurso, error } = useAccionAdmin();

  /** Arma el formulario con el archivo, con el nombre de campo que espera la API. */
  function armarFormulario(archivo: File): FormData {
    const formulario = new FormData();
    formulario.append('archivo', archivo);
    return formulario;
  }

  /** Revisa el archivo elegido y pide la vista previa a la API (no guarda nada). */
  async function alElegirArchivo(evento: ChangeEvent<HTMLInputElement>) {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    const problema = validarArchivoPlanilla(archivo);
    setErrorLocal(problema);
    if (problema) return;
    const resultado = await ejecutar(() =>
      pedirAdmin<ComparacionPlanilla>('/admin/planillas/vista-previa', {
        metodo: 'POST',
        cuerpo: armarFormulario(archivo),
      }),
    );
    if (resultado.ok) setEtapa({ tipo: 'revisar', archivo, comparacion: resultado.valor });
  }

  /** Pide confirmación y aplica todos los cambios de la planilla. */
  async function aplicar(archivo: File, cantidad: number) {
    if (!window.confirm(`¿Aplicar ${cantidad} ${cantidad === 1 ? 'cambio' : 'cambios'} en la tienda?`)) return;
    const resultado = await ejecutar(() =>
      pedirAdmin<ResultadoImportacion>('/admin/planillas/aplicar', {
        metodo: 'POST',
        cuerpo: armarFormulario(archivo),
      }),
    );
    if (resultado.ok) setEtapa({ tipo: 'aplicada', resultado: resultado.valor });
  }

  /** Vuelve al inicio para subir otra planilla. */
  function reiniciar() {
    setEtapa({ tipo: 'elegir' });
    setErrorLocal(null);
    setClaveInput((actual) => actual + 1);
  }

  return (
    <section className={ESTILO_TARJETA}>
      <h2 className="font-titulos text-xl text-texto">2. Subir la planilla modificada</h2>

      {etapa.tipo === 'elegir' && (
        <>
          <p className="mt-2 text-sm text-texto-suave">
            Primero vas a ver qué cambiaría. Nada se guarda hasta que lo confirmes.
          </p>
          <input
            key={claveInput}
            type="file"
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={alElegirArchivo}
            disabled={enCurso}
            aria-label="Elegir planilla"
            className="mt-4 block text-sm text-texto file:mr-3 file:rounded-full file:border-0 file:bg-acento file:px-4 file:py-2 file:font-semibold file:text-white"
          />
          {enCurso && <p className="mt-2 text-sm text-texto-suave">Revisando la planilla…</p>}
        </>
      )}

      {etapa.tipo === 'revisar' && (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-texto">
            <strong>{etapa.archivo.name}</strong>: {etapa.comparacion.cambios.length} con cambios,{' '}
            {etapa.comparacion.sinCambios} sin cambios
            {etapa.comparacion.errores.length > 0 && `, ${etapa.comparacion.errores.length} con errores`}.
          </p>
          {etapa.comparacion.errores.length > 0 && <TablaErrores errores={etapa.comparacion.errores} />}
          {etapa.comparacion.cambios.length > 0 && <TablaCambios cambios={etapa.comparacion.cambios} />}
          {etapa.comparacion.cambios.length === 0 && etapa.comparacion.errores.length === 0 && (
            <p className="text-sm text-texto-suave">La planilla no tiene cambios respecto de la tienda.</p>
          )}
          <div className="flex flex-wrap gap-3">
            {etapa.comparacion.errores.length === 0 && etapa.comparacion.cambios.length > 0 && (
              <button
                type="button"
                disabled={enCurso}
                onClick={() => aplicar(etapa.archivo, etapa.comparacion.cambios.length)}
                className={ESTILOS_ADMIN.botonPrimario}
              >
                {enCurso ? 'Aplicando…' : `Aplicar ${etapa.comparacion.cambios.length} cambios`}
              </button>
            )}
            <button type="button" onClick={reiniciar} disabled={enCurso} className={ESTILOS_ADMIN.botonSecundario}>
              Subir otra planilla
            </button>
          </div>
        </div>
      )}

      {etapa.tipo === 'aplicada' && (
        <div className="mt-4 flex flex-col gap-3">
          <p role="status" className="text-acento-oscuro">
            Listo: se actualizaron {etapa.resultado.actualizadas} variantes ({etapa.resultado.sinCambios} quedaron
            igual).
          </p>
          <button type="button" onClick={reiniciar} className={`self-start ${ESTILOS_ADMIN.botonSecundario}`}>
            Subir otra planilla
          </button>
        </div>
      )}

      <AvisoError mensaje={errorLocal ?? error} />
    </section>
  );
}

/** Pantalla de Excel: descargar, revisar y aplicar cambios masivos de precios y stock. */
export function GestorPlanillas() {
  return (
    <div className="flex flex-col gap-6">
      <SeccionDescarga />
      <SeccionSubida />
    </div>
  );
}
