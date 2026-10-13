'use client';

import type { ReactNode } from 'react';
import type { ContenidoSitio } from '@/lib/api/tipos';
import { useDatosAdmin } from '@/lib/admin/datos';
import { CargandoAdmin, ErrorDeCarga } from '../comunes';
import { ESTILO_TARJETA } from '../producto/campo';
import { SeccionBanner } from './seccion-banner';
import { SeccionCondiciones } from './seccion-condiciones';
import { SeccionContacto } from './seccion-contacto';
import { SeccionFaq } from './seccion-faq';

const SECCIONES = [
  { id: 'contacto', titulo: 'Contacto' },
  { id: 'banner', titulo: 'Banner del inicio' },
  { id: 'preguntas', titulo: 'Preguntas frecuentes' },
  { id: 'condiciones', titulo: 'Condiciones de venta' },
] as const;

type PropsTarjeta = { id: string; titulo: string; children: ReactNode };

/** Tarjeta de una sección, con ancla para saltar desde el índice. */
function TarjetaSeccion({ id, titulo, children }: PropsTarjeta) {
  return (
    <section id={id} className={`${ESTILO_TARJETA} scroll-mt-24`}>
      <h2 className="mb-4 font-titulos text-xl text-texto">{titulo}</h2>
      {children}
    </section>
  );
}

/** Pantalla de contenido: cada sección se guarda por separado. */
export function EditorContenido() {
  const { carga, recargar, reemplazar } = useDatosAdmin<ContenidoSitio>('/contenido');

  if (carga.estado === 'cargando') return <CargandoAdmin />;
  if (carga.estado === 'error') return <ErrorDeCarga mensaje={carga.mensaje} alReintentar={recargar} />;

  const contenido = carga.datos;
  return (
    <div className="flex flex-col gap-6">
      <nav aria-label="Secciones" className="flex flex-wrap gap-2 text-sm">
        {SECCIONES.map((seccion) => (
          <a
            key={seccion.id}
            href={`#${seccion.id}`}
            className="rounded-full border border-borde bg-superficie px-3 py-1 hover:border-acento"
          >
            {seccion.titulo}
          </a>
        ))}
      </nav>
      <TarjetaSeccion id="contacto" titulo="Contacto">
        <SeccionContacto contacto={contenido.contacto} alGuardar={reemplazar} />
      </TarjetaSeccion>
      <TarjetaSeccion id="banner" titulo="Banner del inicio">
        <SeccionBanner banner={contenido.banner} alGuardar={reemplazar} />
      </TarjetaSeccion>
      <TarjetaSeccion id="preguntas" titulo="Preguntas frecuentes">
        <SeccionFaq preguntas={contenido.faq.preguntas} alGuardar={reemplazar} />
      </TarjetaSeccion>
      <TarjetaSeccion id="condiciones" titulo="Condiciones de venta">
        <SeccionCondiciones condiciones={contenido.condiciones} alGuardar={reemplazar} />
      </TarjetaSeccion>
    </div>
  );
}
