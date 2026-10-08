import type { Metadata } from 'next';
import { Fraunces, Manrope } from 'next/font/google';
import { BarraAviso } from '@/componentes/layout/barra-aviso';
import { BotonWhatsApp } from '@/componentes/layout/boton-whatsapp';
import { Encabezado } from '@/componentes/layout/encabezado';
import { PiePagina } from '@/componentes/layout/pie-pagina';
import { obtenerContenido } from '@/lib/api/consultas';
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

/** Estructura común de todas las páginas: aviso, encabezado, contenido, pie y botón de WhatsApp. */
export default async function LayoutRaiz({ children }: { children: React.ReactNode }) {
  const { contacto } = await obtenerContenido();

  return (
    <html lang="es-AR" className={`${fuenteTitulos.variable} ${fuenteTexto.variable}`}>
      <body className="flex min-h-screen flex-col">
        <BarraAviso />
        <Encabezado />
        <main className="flex-1">{children}</main>
        <PiePagina contacto={contacto} />
        <BotonWhatsApp numero={contacto.whatsapp} />
      </body>
    </html>
  );
}
