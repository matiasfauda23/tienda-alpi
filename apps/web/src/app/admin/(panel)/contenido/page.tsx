import type { Metadata } from 'next';
import { EditorContenido } from '@/componentes/admin/contenido/editor-contenido';

export const metadata: Metadata = { title: 'Contenido' };

/** Página del panel para editar los textos y datos de contacto del sitio. */
export default function PaginaContenidoAdmin() {
  return (
    <>
      <h1 className="mb-6 font-titulos text-3xl text-texto">Contenido del sitio</h1>
      <EditorContenido />
    </>
  );
}

// El panel depende de la sesión del navegador: no se puede validar la navegación instantánea
export const instant = false;
