'use client';

import { aplicarDescuento, ordenarEscalas, type EscalaPrecio } from '@tienda-alpi/precios';
import { useState } from 'react';
import { formatearPrecio } from '@/lib/formato';
import { describirRango } from '@/lib/precios-producto';
import { pedirAdmin } from '@/lib/admin/cliente-admin';
import { useAccionAdmin, useDatosAdmin } from '@/lib/admin/datos';
import {
  buscarErrorEnConjunto,
  conIdsProvisorios,
  convertirBorradoresEscalas,
  crearBorradoresEscalas,
  crearBorradorEscalaNueva,
  sonDistintasEscalas,
  validarBorradorEscala,
  type BorradorEscala,
} from '@/lib/admin/escalas-admin';
import { hayErrores, leerEntero, soloDigitos } from '@/lib/admin/formulario-producto';
import { AvisoError, CargandoAdmin, ErrorDeCarga, ESTILOS_ADMIN } from './comunes';
import { Campo, ESTILO_TARJETA } from './producto/campo';

const MAXIMO_ESCALAS = 10;

type PropsFormulario = {
  escalas: EscalaPrecio[];
  guardado: boolean;
  alEditar: () => void;
  alGuardar: (escalas: EscalaPrecio[]) => void;
};

/** Ejemplo de cómo quedan los precios con las escalas que se están editando. */
function VistaPrevia({ escalas }: { escalas: EscalaPrecio[] }) {
  const [precioTexto, setPrecioTexto] = useState('10000');
  const precio = leerEntero(precioTexto) ?? 0;
  const ordenadas = ordenarEscalas(escalas);
  return (
    <div className="rounded-xl border border-borde bg-fondo p-4">
      <label className="flex flex-wrap items-center gap-2 text-sm text-texto">
        Ejemplo con un producto de $
        <input
          inputMode="numeric"
          value={precioTexto}
          onChange={(evento) => setPrecioTexto(soloDigitos(evento.target.value))}
          className={`${ESTILOS_ADMIN.campo} w-28`}
        />
      </label>
      <ul className="mt-3 flex flex-col gap-1 text-sm">
        {ordenadas.map((escala, indice) => (
          <li key={escala.id} className="flex justify-between gap-4">
            <span className="text-texto-suave">
              {escala.nombre} ({describirRango(escala.cantidadMinima, ordenadas[indice + 1] ? ordenadas[indice + 1].cantidadMinima - 1 : null)} u.)
            </span>
            <span className="font-semibold text-texto">
              {formatearPrecio(aplicarDescuento(precio, escala.porcentajeDescuento))}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Formulario con la lista completa de escalas; se guarda todo junto. */
function FormularioEscalas({ escalas, guardado, alEditar, alGuardar }: PropsFormulario) {
  const [borradores, setBorradores] = useState(() => crearBorradoresEscalas(escalas));
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const { ejecutar, enCurso, error } = useAccionAdmin();

  const erroresPorFila = borradores.map(validarBorradorEscala);
  const filasValidas = !erroresPorFila.some(hayErrores);
  const convertidas = convertirBorradoresEscalas(borradores);
  const errorConjunto = filasValidas ? buscarErrorEnConjunto(convertidas) : null;
  const hayCambios = sonDistintasEscalas(escalas, convertidas);

  /** Cambia la lista y avisa que hay cambios sin guardar. */
  function actualizar(nuevos: BorradorEscala[]) {
    setBorradores(nuevos);
    alEditar();
  }

  /** Cambia un campo de una escala. */
  function cambiar(clave: string, campo: keyof BorradorEscala, valor: string) {
    actualizar(borradores.map((b) => (b.clave === clave ? { ...b, [campo]: valor } : b)));
  }

  /** Valida, pide confirmación y reemplaza todas las escalas. */
  async function guardar() {
    setMostrarErrores(true);
    if (!filasValidas || errorConjunto) return;
    if (!window.confirm('Esto cambia los precios por cantidad de toda la tienda. ¿Guardar las escalas?')) return;
    const resultado = await ejecutar(() =>
      pedirAdmin<EscalaPrecio[]>('/admin/escalas', { metodo: 'PUT', cuerpo: { escalas: convertidas } }),
    );
    if (resultado.ok) alGuardar(resultado.valor);
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {borradores.map((borrador, indice) => {
          const visibles = mostrarErrores ? erroresPorFila[indice] : {};
          return (
            <li key={borrador.clave} className={ESTILO_TARJETA}>
              <div className="grid items-end gap-3 sm:grid-cols-[1fr_140px_140px_auto]">
                <Campo etiqueta="Nombre" error={visibles.nombre}>
                  <input
                    value={borrador.nombre}
                    maxLength={60}
                    onChange={(evento) => cambiar(borrador.clave, 'nombre', evento.target.value)}
                    placeholder="Mayorista"
                    className={ESTILOS_ADMIN.campo}
                  />
                </Campo>
                <Campo etiqueta="Desde (unidades)" error={visibles.cantidadMinima}>
                  <input
                    inputMode="numeric"
                    value={borrador.cantidadMinima}
                    onChange={(evento) => cambiar(borrador.clave, 'cantidadMinima', soloDigitos(evento.target.value))}
                    className={ESTILOS_ADMIN.campo}
                  />
                </Campo>
                <Campo etiqueta="Descuento (%)" error={visibles.porcentajeDescuento}>
                  <input
                    inputMode="numeric"
                    value={borrador.porcentajeDescuento}
                    onChange={(evento) =>
                      cambiar(borrador.clave, 'porcentajeDescuento', soloDigitos(evento.target.value))
                    }
                    className={ESTILOS_ADMIN.campo}
                  />
                </Campo>
                <button
                  type="button"
                  disabled={borradores.length === 1}
                  onClick={() => actualizar(borradores.filter((b) => b.clave !== borrador.clave))}
                  className={`pb-2 ${ESTILOS_ADMIN.botonPeligro}`}
                >
                  Quitar
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      {borradores.length < MAXIMO_ESCALAS && (
        <button
          type="button"
          onClick={() => actualizar([...borradores, crearBorradorEscalaNueva(borradores)])}
          className={`self-start ${ESTILOS_ADMIN.botonSecundario}`}
        >
          + Agregar escala
        </button>
      )}

      {filasValidas && !errorConjunto && <VistaPrevia escalas={conIdsProvisorios(convertidas)} />}
      {filasValidas && errorConjunto && <AvisoError mensaje={errorConjunto} />}
      {mostrarErrores && !filasValidas && <AvisoError mensaje="Revisá los campos marcados en rojo." />}
      <AvisoError mensaje={error} />

      <div className="flex flex-wrap items-center gap-4">
        <button type="button" onClick={guardar} disabled={!hayCambios || enCurso} className={ESTILOS_ADMIN.botonPrimario}>
          {enCurso ? 'Guardando…' : 'Guardar escalas'}
        </button>
        {guardado && !hayCambios && (
          <p role="status" className="text-sm text-acento-oscuro">
            Escalas guardadas.
          </p>
        )}
      </div>
    </div>
  );
}

/** Pantalla de escalas: carga las actuales y recrea el formulario después de guardar. */
export function EditorEscalas() {
  const { carga, recargar, reemplazar } = useDatosAdmin<EscalaPrecio[]>('/escalas');
  const [guardado, setGuardado] = useState(false);

  if (carga.estado === 'cargando') return <CargandoAdmin />;
  if (carga.estado === 'error') return <ErrorDeCarga mensaje={carga.mensaje} alReintentar={recargar} />;

  return (
    <FormularioEscalas
      key={JSON.stringify(carga.datos)}
      escalas={carga.datos}
      guardado={guardado}
      alEditar={() => setGuardado(false)}
      alGuardar={(escalas) => {
        reemplazar(escalas);
        setGuardado(true);
      }}
    />
  );
}
