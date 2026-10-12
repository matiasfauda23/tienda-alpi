import Form from 'next/form';
import Link from 'next/link';
import type { Categoria } from '@/lib/api/tipos';
import {
  hayFiltrosActivos,
  ORDENES_CATALOGO,
  type FiltrosCatalogo,
  type OrdenCatalogo,
} from '@/lib/catalogo';

const ETIQUETAS_ORDEN: Record<OrdenCatalogo, string> = {
  recientes: 'Más recientes',
  'precio-asc': 'Menor precio',
  'precio-desc': 'Mayor precio',
  nombre: 'Nombre (A-Z)',
};

const ESTILO_CAMPO =
  'w-full rounded-lg border border-borde bg-fondo px-3 py-2 text-sm text-texto focus:border-acento focus:outline-none';

type Props = { filtros: FiltrosCatalogo; categorias: Categoria[] };

/** Formulario de filtros del catálogo: deja todo el estado en la URL. */
export function PanelFiltros({ filtros, categorias }: Props) {
  return (
    <Form action="/productos" className="flex flex-col gap-6 rounded-2xl border border-borde bg-superficie p-5">
      <label className="flex flex-col gap-2 text-sm font-semibold text-texto">
        Buscar
        <input
          type="search"
          name="buscar"
          defaultValue={filtros.buscar}
          maxLength={100}
          placeholder="Ej: mate imperial"
          className={ESTILO_CAMPO}
        />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-semibold text-texto">Categorías</legend>
        {categorias.map((categoria) => (
          <label key={categoria.id} className="flex items-center gap-2 text-sm text-texto">
            <input
              type="checkbox"
              name="categoria"
              value={categoria.slug}
              defaultChecked={filtros.categorias.includes(categoria.slug)}
              className="size-4 accent-acento"
            />
            {categoria.nombre}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend className="mb-2 text-sm font-semibold text-texto">Precio por unidad</legend>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            name="precioMin"
            min={0}
            step={1}
            placeholder="Mínimo"
            aria-label="Precio mínimo"
            defaultValue={filtros.precioMin}
            className={ESTILO_CAMPO}
          />
          <input
            type="number"
            name="precioMax"
            min={0}
            step={1}
            placeholder="Máximo"
            aria-label="Precio máximo"
            defaultValue={filtros.precioMax}
            className={ESTILO_CAMPO}
          />
        </div>
      </fieldset>

      <label className="flex flex-col gap-2 text-sm font-semibold text-texto">
        Ordenar por
        <select name="orden" defaultValue={filtros.orden} className={ESTILO_CAMPO}>
          {ORDENES_CATALOGO.map((orden) => (
            <option key={orden} value={orden}>
              {ETIQUETAS_ORDEN[orden]}
            </option>
          ))}
        </select>
      </label>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className="rounded-full bg-acento px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-acento-oscuro"
        >
          Aplicar filtros
        </button>
        {hayFiltrosActivos(filtros) && (
          <Link href="/productos" className="text-center text-sm text-texto-suave underline hover:text-texto">
            Limpiar filtros
          </Link>
        )}
      </div>
    </Form>
  );
}
