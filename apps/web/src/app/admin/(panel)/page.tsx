import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Inicio' };

const SECCIONES = [
  { href: '/admin/productos', titulo: 'Productos', texto: 'Crear y editar productos, variantes, precios y stock.' },
  { href: '/admin/escalas', titulo: 'Escalas', texto: 'Definir desde cuántas unidades aplica cada descuento.' },
  { href: '/admin/contenido', titulo: 'Contenido', texto: 'Contacto, banner, preguntas frecuentes y condiciones.' },
  { href: '/admin/planillas', titulo: 'Excel', texto: 'Descargar la planilla o actualizar precios y stock en masa.' },
] as const;

/** Inicio del panel: accesos a cada sección. */
export default function PaginaInicioPanel() {
  return (
    <>
      <h1 className="font-titulos text-3xl text-texto">Panel de administración</h1>
      <p className="mt-2 text-texto-suave">¿Qué querés actualizar hoy?</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {SECCIONES.map((seccion) => (
          <li key={seccion.href}>
            <Link
              href={seccion.href}
              className="block h-full rounded-2xl border border-borde bg-superficie p-6 transition hover:border-acento"
            >
              <h2 className="font-titulos text-xl text-texto">{seccion.titulo}</h2>
              <p className="mt-2 text-sm text-texto-suave">{seccion.texto}</p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

// El panel depende de la sesión del navegador: no se puede validar la navegación instantánea
export const instant = false;
