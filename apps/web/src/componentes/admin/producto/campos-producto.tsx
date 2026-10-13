'use client';

import type { Categoria } from '@/lib/api/tipos';
import type { BorradorProducto, Errores } from '@/lib/admin/formulario-producto';
import { ESTILOS_ADMIN } from '../comunes';
import { Campo } from './campo';

type Props = {
  borrador: BorradorProducto;
  errores: Errores<BorradorProducto>;
  categorias: Categoria[];
  alCambiar: (borrador: BorradorProducto) => void;
};

type PropsCasilla = { etiqueta: string; ayuda: string; marcada: boolean; alCambiar: (marcada: boolean) => void };

/** Casilla de verificación con una ayuda corta debajo. */
function Casilla({ etiqueta, ayuda, marcada, alCambiar }: PropsCasilla) {
  return (
    <label className="flex items-start gap-2 text-sm text-texto">
      <input
        type="checkbox"
        checked={marcada}
        onChange={(evento) => alCambiar(evento.target.checked)}
        className="mt-0.5 size-4 accent-acento"
      />
      <span>
        {etiqueta}
        <span className="block text-xs text-texto-suave">{ayuda}</span>
      </span>
    </label>
  );
}

/** Campos generales del producto: nombre, categoría, descripción y marcas. */
export function CamposProducto({ borrador, errores, categorias, alCambiar }: Props) {
  /** Cambia un campo del borrador manteniendo el resto. */
  function cambiar<K extends keyof BorradorProducto>(campo: K, valor: BorradorProducto[K]) {
    alCambiar({ ...borrador, [campo]: valor });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Campo etiqueta="Nombre" error={errores.nombre}>
        <input
          value={borrador.nombre}
          maxLength={120}
          onChange={(evento) => cambiar('nombre', evento.target.value)}
          placeholder="Mate Imperial de Calabaza"
          aria-invalid={Boolean(errores.nombre)}
          className={ESTILOS_ADMIN.campo}
        />
      </Campo>
      <Campo etiqueta="Categoría" error={errores.categoriaId}>
        <select
          value={borrador.categoriaId}
          onChange={(evento) => cambiar('categoriaId', evento.target.value)}
          aria-invalid={Boolean(errores.categoriaId)}
          className={ESTILOS_ADMIN.campo}
        >
          <option value="">Elegí una categoría</option>
          {categorias.map((categoria) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
              {categoria.activa ? '' : ' (oculta)'}
            </option>
          ))}
        </select>
      </Campo>
      <Campo
        etiqueta={`Descripción (${borrador.descripcion.length}/2000, opcional)`}
        error={errores.descripcion}
        className="sm:col-span-2"
      >
        <textarea
          value={borrador.descripcion}
          rows={4}
          maxLength={2000}
          onChange={(evento) => cambiar('descripcion', evento.target.value)}
          className={ESTILOS_ADMIN.campo}
        />
      </Campo>
      <div className="flex flex-wrap gap-6 sm:col-span-2">
        <Casilla
          etiqueta="Visible en la tienda"
          ayuda="Si lo desmarcás, queda oculto."
          marcada={borrador.activo}
          alCambiar={(marcada) => cambiar('activo', marcada)}
        />
        <Casilla
          etiqueta="Destacado"
          ayuda="Aparece primero en el inicio."
          marcada={borrador.destacado}
          alCambiar={(marcada) => cambiar('destacado', marcada)}
        />
        <Casilla
          etiqueta="Nuevo"
          ayuda="Muestra la etiqueta 'Nuevo'."
          marcada={borrador.nuevo}
          alCambiar={(marcada) => cambiar('nuevo', marcada)}
        />
      </div>
    </div>
  );
}
