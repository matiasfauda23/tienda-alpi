'use client';

import { useState } from 'react';
import type { Producto, Variante } from '@/lib/api/tipos';
import { pedirAdmin } from '@/lib/admin/cliente-admin';
import { useAccionAdmin } from '@/lib/admin/datos';
import {
  convertirBorradorVariante,
  crearBorradorVariante,
  datosDeVariante,
  diferencias,
  hayErrores,
  validarBorradorVariante,
  type BorradorVariante,
} from '@/lib/admin/formulario-producto';
import { AvisoError, ESTILOS_ADMIN } from '../comunes';
import { ESTILO_TARJETA } from './campo';
import { CamposVariante } from './campos-variante';
import { EditorPreciosFijos } from './editor-precios-fijos';

type Props = { producto: Producto; alCambiar: (producto: Producto) => void };

/** Una variante existente: se edita en el lugar y se guarda solo lo que cambió. */
function FilaVariante({ producto, variante, alCambiar }: Props & { variante: Variante }) {
  const [borrador, setBorrador] = useState(() => crearBorradorVariante(variante));
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [verPrecios, setVerPrecios] = useState(false);
  const { ejecutar, enCurso, error } = useAccionAdmin();
  const errores = validarBorradorVariante(borrador);
  const hayCambios = JSON.stringify(borrador) !== JSON.stringify(crearBorradorVariante(variante));
  const ruta = `/admin/productos/${producto.id}/variantes/${variante.id}`;
  const esUnica = producto.variantes.length === 1;

  /** Actualiza el borrador y borra el aviso de "guardado". */
  function cambiar(nuevo: BorradorVariante) {
    setBorrador(nuevo);
    setGuardado(false);
  }

  /** Valida y guarda solo los campos que cambiaron. */
  async function guardar() {
    setMostrarErrores(true);
    if (hayErrores(errores)) return;
    const cambios = diferencias(datosDeVariante(variante), convertirBorradorVariante(borrador));
    const resultado = await ejecutar(() => pedirAdmin<Producto>(ruta, { metodo: 'PATCH', cuerpo: cambios }));
    if (resultado.ok) {
      alCambiar(resultado.valor);
      setMostrarErrores(false);
      setGuardado(true);
    }
  }

  /** Pide confirmación, elimina la variante y trae el producto actualizado. */
  async function eliminar() {
    if (!window.confirm(`¿Eliminar la variante "${variante.nombre}" (${variante.sku})?`)) return;
    const resultado = await ejecutar(async () => {
      await pedirAdmin<null>(ruta, { metodo: 'DELETE' });
      return pedirAdmin<Producto>(`/admin/productos/${producto.id}`);
    });
    if (resultado.ok) alCambiar(resultado.valor);
  }

  return (
    <li className={ESTILO_TARJETA}>
      <CamposVariante borrador={borrador} errores={mostrarErrores ? errores : {}} alCambiar={cambiar} />
      <div className="mt-4 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={guardar}
          disabled={!hayCambios || enCurso}
          className={ESTILOS_ADMIN.botonPrimario}
        >
          Guardar variante
        </button>
        <button
          type="button"
          onClick={eliminar}
          disabled={enCurso || esUnica}
          title={esUnica ? 'Un producto necesita al menos una variante.' : undefined}
          className={ESTILOS_ADMIN.botonPeligro}
        >
          Eliminar
        </button>
        <button
          type="button"
          onClick={() => setVerPrecios(!verPrecios)}
          aria-expanded={verPrecios}
          className="text-sm font-semibold text-acento-oscuro hover:underline"
        >
          {verPrecios
            ? 'Ocultar precios por escala'
            : `Precios por escala${variante.preciosFijos.length > 0 ? ` (${variante.preciosFijos.length} fijos)` : ''}`}
        </button>
        {guardado && (
          <p role="status" className="text-sm text-acento-oscuro">
            Cambios guardados.
          </p>
        )}
      </div>
      <AvisoError mensaje={error} />
      {verPrecios && <EditorPreciosFijos producto={producto} variante={variante} alCambiar={alCambiar} />}
    </li>
  );
}

/** Formulario desplegable para agregar una variante al producto. */
function NuevaVariante({ producto, alCambiar }: Props) {
  const [abierta, setAbierta] = useState(false);
  const [borrador, setBorrador] = useState(() => crearBorradorVariante(undefined, producto.variantes.length));
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const { ejecutar, enCurso, error } = useAccionAdmin();
  const errores = validarBorradorVariante(borrador);

  /** Valida y crea la variante; si sale bien, cierra el formulario. */
  async function crear() {
    setMostrarErrores(true);
    if (hayErrores(errores)) return;
    const resultado = await ejecutar(() =>
      pedirAdmin<Producto>(`/admin/productos/${producto.id}/variantes`, {
        metodo: 'POST',
        cuerpo: convertirBorradorVariante(borrador),
      }),
    );
    if (resultado.ok) {
      alCambiar(resultado.valor);
      setAbierta(false);
      setMostrarErrores(false);
      setBorrador(crearBorradorVariante(undefined, resultado.valor.variantes.length));
    }
  }

  if (!abierta) {
    return (
      <button type="button" onClick={() => setAbierta(true)} className={`self-start ${ESTILOS_ADMIN.botonSecundario}`}>
        + Agregar variante
      </button>
    );
  }

  return (
    <div className={`${ESTILO_TARJETA} border-acento`}>
      <h3 className="mb-3 font-semibold text-texto">Nueva variante</h3>
      <CamposVariante borrador={borrador} errores={mostrarErrores ? errores : {}} alCambiar={setBorrador} />
      <div className="mt-4 flex gap-3">
        <button type="button" onClick={crear} disabled={enCurso} className={ESTILOS_ADMIN.botonPrimario}>
          Crear variante
        </button>
        <button type="button" onClick={() => setAbierta(false)} className={ESTILOS_ADMIN.botonSecundario}>
          Cancelar
        </button>
      </div>
      <AvisoError mensaje={error} />
    </div>
  );
}

/** Sección de variantes del editor: las existentes y el alta de nuevas. */
export function SeccionVariantes({ producto, alCambiar }: Props) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-titulos text-2xl text-texto">Variantes ({producto.variantes.length})</h2>
      <ul className="flex flex-col gap-4">
        {producto.variantes.map((variante) => (
          <FilaVariante key={variante.id} producto={producto} variante={variante} alCambiar={alCambiar} />
        ))}
      </ul>
      <NuevaVariante producto={producto} alCambiar={alCambiar} />
    </section>
  );
}
