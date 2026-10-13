'use client';

import { useState, type FormEvent } from 'react';
import type { Categoria } from '@/lib/api/tipos';
import { pedirAdmin } from '@/lib/admin/cliente-admin';
import {
  armarCambiosCategoria,
  calcularSiguienteOrden,
  crearBorradorCategoria,
  ordenarCategorias,
  validarBorradorCategoria,
} from '@/lib/admin/categorias-admin';
import { useAccionAdmin, useDatosAdmin } from '@/lib/admin/datos';
import { AvisoError, CargandoAdmin, ErrorDeCarga, ESTILOS_ADMIN } from './comunes';

type PropsFila = {
  categoria: Categoria;
  alGuardar: (categoria: Categoria) => void;
  alEliminar: (id: string) => void;
};

/** Una categoría editable en el lugar: nombre, orden y visibilidad. */
function FilaCategoria({ categoria, alGuardar, alEliminar }: PropsFila) {
  const [borrador, setBorrador] = useState(() => crearBorradorCategoria(categoria));
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const { ejecutar, enCurso, error } = useAccionAdmin();
  const cambios = armarCambiosCategoria(categoria, borrador);
  const hayCambios = Object.keys(cambios).length > 0;

  /** Valida y guarda solo los campos que cambiaron. */
  async function guardar() {
    const problema = validarBorradorCategoria(borrador);
    setErrorLocal(problema);
    if (problema) return;
    const resultado = await ejecutar(() =>
      pedirAdmin<Categoria>(`/admin/categorias/${categoria.id}`, { metodo: 'PATCH', cuerpo: cambios }),
    );
    if (resultado.ok) alGuardar(resultado.valor);
  }

  /** Pide confirmación y elimina la categoría (la API lo impide si tiene productos). */
  async function eliminar() {
    if (!window.confirm(`¿Eliminar la categoría "${categoria.nombre}"? Solo se puede si no tiene productos.`)) return;
    const resultado = await ejecutar(() =>
      pedirAdmin<null>(`/admin/categorias/${categoria.id}`, { metodo: 'DELETE' }),
    );
    if (resultado.ok) alEliminar(categoria.id);
  }

  return (
    <li className="flex flex-col gap-2 rounded-2xl border border-borde bg-superficie p-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-texto-suave">
          Nombre
          <input
            value={borrador.nombre}
            maxLength={80}
            onChange={(evento) => setBorrador({ ...borrador, nombre: evento.target.value })}
            className={ESTILOS_ADMIN.campo}
          />
        </label>
        <label className="flex w-24 flex-col gap-1 text-xs text-texto-suave">
          Orden
          <input
            inputMode="numeric"
            value={borrador.orden}
            onChange={(evento) => setBorrador({ ...borrador, orden: evento.target.value.replace(/\D/g, '') })}
            className={ESTILOS_ADMIN.campo}
          />
        </label>
        <label className="flex items-center gap-2 pb-2 text-sm text-texto">
          <input
            type="checkbox"
            checked={borrador.activa}
            onChange={(evento) => setBorrador({ ...borrador, activa: evento.target.checked })}
            className="size-4 accent-acento"
          />
          Visible
        </label>
        <button
          type="button"
          onClick={guardar}
          disabled={!hayCambios || enCurso}
          className={ESTILOS_ADMIN.botonPrimario}
        >
          Guardar
        </button>
        <button type="button" onClick={eliminar} disabled={enCurso} className={`pb-2 ${ESTILOS_ADMIN.botonPeligro}`}>
          Eliminar
        </button>
      </div>
      <p className="text-xs text-texto-suave">Dirección: /productos?categoria={categoria.slug}</p>
      <AvisoError mensaje={errorLocal ?? error} />
    </li>
  );
}

/** Pantalla de categorías: crear, editar en el lugar y eliminar. */
export function GestorCategorias() {
  const { carga, recargar, reemplazar } = useDatosAdmin<Categoria[]>('/admin/categorias');
  const { ejecutar, enCurso, error } = useAccionAdmin();
  const [nombreNueva, setNombreNueva] = useState('');
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  if (carga.estado === 'cargando') return <CargandoAdmin />;
  if (carga.estado === 'error') return <ErrorDeCarga mensaje={carga.mensaje} alReintentar={recargar} />;

  const categorias = ordenarCategorias(carga.datos);

  /** Crea una categoría al final de la lista. */
  async function crear(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const orden = calcularSiguienteOrden(categorias);
    const problema = validarBorradorCategoria({ nombre: nombreNueva, orden: String(orden), activa: true });
    setErrorLocal(problema);
    if (problema) return;
    const resultado = await ejecutar(() =>
      pedirAdmin<Categoria>('/admin/categorias', {
        metodo: 'POST',
        cuerpo: { nombre: nombreNueva.trim(), orden, activa: true },
      }),
    );
    if (resultado.ok) {
      reemplazar([...categorias, resultado.valor]);
      setNombreNueva('');
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={crear} className="flex flex-col gap-2 rounded-2xl border border-borde bg-superficie p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex min-w-48 flex-1 flex-col gap-1 text-xs text-texto-suave">
            Nueva categoría
            <input
              value={nombreNueva}
              maxLength={80}
              onChange={(evento) => setNombreNueva(evento.target.value)}
              placeholder="Ej: Yerberas"
              className={ESTILOS_ADMIN.campo}
            />
          </label>
          <button type="submit" disabled={enCurso} className={ESTILOS_ADMIN.botonPrimario}>
            Crear
          </button>
        </div>
        <AvisoError mensaje={errorLocal ?? error} />
      </form>

      <ul className="flex flex-col gap-3">
        {categorias.map((categoria) => (
          <FilaCategoria
            key={categoria.id}
            categoria={categoria}
            alGuardar={(guardada) =>
              reemplazar(categorias.map((actual) => (actual.id === guardada.id ? guardada : actual)))
            }
            alEliminar={(id) => reemplazar(categorias.filter((actual) => actual.id !== id))}
          />
        ))}
      </ul>
    </div>
  );
}
