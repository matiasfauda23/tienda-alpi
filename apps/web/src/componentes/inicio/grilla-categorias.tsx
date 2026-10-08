import Link from 'next/link';
import type { Categoria } from '@/lib/api/tipos';
import { IlustracionProducto } from '../ui/ilustracion-producto';

/** Grilla con una tarjeta por categoría, que lleva al catálogo filtrado. */
export function GrillaCategorias({ categorias }: { categorias: Categoria[] }) {
  if (categorias.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h2 className="mb-6 font-titulos text-3xl font-medium">Categorías</h2>

      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {categorias.map((categoria) => (
          <li key={categoria.id}>
            <Link href={`/productos?categoria=${categoria.slug}`} className="group flex flex-col gap-3">
              <IlustracionProducto categoria={categoria.slug} className="aspect-square rounded-2xl transition-transform group-hover:scale-[1.02]" />
              <span className="flex items-center justify-between">
                <span className="text-lg font-semibold">{categoria.nombre}</span>
                <span className="text-sm text-texto-suave" aria-hidden="true">→</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
