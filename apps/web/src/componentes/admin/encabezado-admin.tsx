'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSesion } from '@/lib/admin/sesion';
import { esEnlaceActivo } from '@/lib/admin/utilidades';

const ENLACES_ADMIN = [
  { href: '/admin', texto: 'Inicio' },
  { href: '/admin/productos', texto: 'Productos' },
  { href: '/admin/escalas', texto: 'Escalas' },
  { href: '/admin/contenido', texto: 'Contenido' },
  { href: '/admin/planillas', texto: 'Excel' },
] as const;

/** Encabezado del panel: secciones, usuario conectado y botón para salir. */
export function EncabezadoAdmin({ email }: { email: string }) {
  const rutaActual = usePathname();
  const { salir } = useSesion();
  return (
    <header className="border-b border-borde bg-superficie">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/admin" className="font-titulos text-lg text-texto">
          Panel Alpi
        </Link>
        <nav aria-label="Panel" className="flex min-w-0 flex-1 gap-1 overflow-x-auto text-sm">
          {ENLACES_ADMIN.map((enlace) => {
            const activo = esEnlaceActivo(enlace.href, rutaActual);
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                aria-current={activo ? 'page' : undefined}
                className={`whitespace-nowrap rounded-full px-3 py-1.5 transition ${
                  activo ? 'bg-acento-suave font-semibold text-acento-tinta' : 'text-texto-suave hover:text-texto'
                }`}
              >
                {enlace.texto}
              </Link>
            );
          })}
        </nav>
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <span className="hidden text-texto-suave sm:inline">{email}</span>
          <a href="/" target="_blank" rel="noopener noreferrer" className="text-texto-suave underline hover:text-texto">
            Ver tienda
          </a>
          <button type="button" onClick={salir} className="font-semibold text-oferta hover:underline">
            Salir
          </button>
        </div>
      </div>
    </header>
  );
}
