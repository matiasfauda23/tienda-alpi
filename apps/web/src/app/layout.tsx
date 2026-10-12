import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import './globals.css';

// Next descarga las fuentes al compilar y las sirve desde el mismo sitio (sin pedirlas a Google en cada visita)
const fuenteTitulos = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const fuenteTexto = Manrope({ subsets: ['latin'], variable: '--font-manrope', display: 'swap' });

/** Título y descripción por defecto de todas las páginas (cada página puede pisarlos). */
export const metadata: Metadata = {
  title: {
    default: 'Tienda Alpi · Mates térmicos, vasos y bombillas',
    template: '%s · Tienda Alpi',
  },
  description:
    'Fabricantes de mates térmicos, vasos y bombillas. Precios mayoristas por cantidad y envíos a todo el país.',
};

/** Estructura base de todo el sitio (público y panel): idioma, fuentes y estilos globales. */
export default function LayoutRaiz({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR" className={`${fuenteTitulos.variable} ${fuenteTexto.variable}`}>
      <body className="flex min-h-screen flex-col">{children}</body>
    </html>
  );
}
