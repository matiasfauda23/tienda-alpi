import Link from 'next/link';
import { Logo } from '../ui/logo';

/** Secciones del menú principal. */
const ENLACES = [
  { href: '/productos', texto: 'Productos' },
  { href: '/#precios', texto: 'Precios por cantidad' },
  { href: '/condiciones', texto: 'Condiciones de venta' },
  { href: '/preguntas-frecuentes', texto: 'Preguntas frecuentes' },
] as const;

/** Encabezado con el logo y el menú. En celulares el menú se desliza de costado. */
export function Encabezado() {
  return (
    <header className="border-b border-borde bg-superficie">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Tienda Alpi, ir al inicio" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="flex gap-6 overflow-x-auto text-[15px] font-medium">
          {ENLACES.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="whitespace-nowrap py-2 hover:text-acento">
              {enlace.texto}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
