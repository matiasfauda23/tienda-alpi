import { BarraAviso } from '@/componentes/layout/barra-aviso';
import { BotonWhatsApp } from '@/componentes/layout/boton-whatsapp';
import { Encabezado } from '@/componentes/layout/encabezado';
import { PiePagina } from '@/componentes/layout/pie-pagina';
import { obtenerContenido } from '@/lib/api/consultas';

/** Estructura de las páginas públicas: aviso, encabezado, contenido, pie y botón de WhatsApp. */
export default async function LayoutSitio({ children }: { children: React.ReactNode }) {
  const { contacto } = await obtenerContenido();
  return (
    <>
      <BarraAviso />
      <Encabezado />
      <main className="flex-1">{children}</main>
      <PiePagina contacto={contacto} />
      <BotonWhatsApp numero={contacto.whatsapp} />
    </>
  );
}
