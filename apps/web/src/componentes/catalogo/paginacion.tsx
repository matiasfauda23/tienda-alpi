import Link from 'next/link';
import type { ReactNode } from 'react';
import { armarUrlCatalogo, type FiltrosCatalogo } from '@/lib/catalogo';

type PropsLink = { filtros: FiltrosCatalogo; pagina: number; habilitado: boolean; children: ReactNode };

/** Link a otra página del catálogo, o texto apagado si no se puede ir. */
function LinkDePagina({ filtros, pagina, habilitado, children }: PropsLink) {
  const estilo = 'rounded-full border border-borde px-4 py-2 text-sm';
  if (!habilitado) {
    return <span aria-disabled="true" className={`${estilo} text-texto-suave opacity-50`}>{children}</span>;
  }
  return (
    <Link href={armarUrlCatalogo(filtros, { pagina })} className={`${estilo} bg-superficie text-texto hover:border-acento`}>
      {children}
    </Link>
  );
}

type Props = { filtros: FiltrosCatalogo; totalPaginas: number };

/** Navegación anterior/siguiente que conserva los filtros actuales. */
export function Paginacion({ filtros, totalPaginas }: Props) {
  if (totalPaginas <= 1) return null;
  const { pagina } = filtros;
  return (
    <nav aria-label="Paginación" className="mt-10 flex items-center justify-center gap-4">
      <LinkDePagina filtros={filtros} pagina={pagina - 1} habilitado={pagina > 1}>
        ← Anterior
      </LinkDePagina>
      <span className="text-sm text-texto-suave">
        Página {pagina} de {totalPaginas}
      </span>
      <LinkDePagina filtros={filtros} pagina={pagina + 1} habilitado={pagina < totalPaginas}>
        Siguiente →
      </LinkDePagina>
    </nav>
  );
}
