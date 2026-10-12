import Link from 'next/link';
import { IndicadorPedido } from '../pedido/indicador-pedido';
import { Logo } from '../ui/logo';

/** Secciones del menú principal. */
const ENLACES = [
  { href: '/productos', texto: 'Productos' },
  { href: '/#precios', texto: 'Precios por cantidad' },
  { href: '/condiciones', texto: 'Condiciones de venta' },
  { href: '/preguntas-frecuentes', texto: 'Preguntas frecuentes' },
] as const;

/** Encabezado con el logo, el menú (desplazable en celulares) y el acceso al pedido. */
export function Encabezado() {
  return (
    <header className="border-b border-borde bg-superficie">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="Tienda Alpi, ir al inicio" className="shrink-0">
          <Logo />
        </Link>

        <nav
          aria-label="Principal"
          className="flex min-w-0 flex-1 gap-6 overflow-x-auto text-[15px] font-medium"
        >
          {ENLACES.map((enlace) => (
            <Link key={enlace.href} href={enlace.href} className="whitespace-nowrap py-2 hover:text-acento">
              {enlace.texto}
            </Link>
          ))}
        </nav>

        <div className="shrink-0">
          <IndicadorPedido />
        </div>
      </div>
    </header>
  );
}
