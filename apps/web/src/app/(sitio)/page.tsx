import { GrillaCategorias } from '@/componentes/inicio/grilla-categorias';
import { Portada } from '@/componentes/inicio/portada';
import { SeccionPrecios } from '@/componentes/inicio/seccion-precios';
import { obtenerCategorias, obtenerContenido, obtenerEscalas } from '@/lib/api/consultas';

/** Página de inicio: portada, categorías y explicación de los precios por cantidad. */
export default async function Inicio() {
  // Las tres consultas se hacen al mismo tiempo, no una después de la otra
  const [contenido, categorias, escalas] = await Promise.all([
    obtenerContenido(),
    obtenerCategorias(),
    obtenerEscalas(),
  ]);

  return (
    <>
      <Portada banner={contenido.banner} />
      <GrillaCategorias categorias={categorias} />
      <SeccionPrecios escalas={escalas} />
    </>
  );
}
