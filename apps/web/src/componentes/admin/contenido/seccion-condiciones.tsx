'use client';

import { useState } from 'react';
import { TextoMarkdown } from '@/componentes/contenido/texto-markdown';
import type { Condiciones, ContenidoSitio } from '@/lib/api/tipos';
import { pedirAdmin } from '@/lib/admin/cliente-admin';
import { useAccionAdmin } from '@/lib/admin/datos';
import { useEdicion } from '@/lib/admin/edicion';
import { ESTILOS_ADMIN } from '../comunes';
import { PieSeccion } from './pie-seccion';

const LARGO_MAXIMO = 10_000;

type Props = { condiciones: Condiciones; alGuardar: (contenido: ContenidoSitio) => void };

/** Condiciones de venta en Markdown, con vista previa igual a la de la tienda. */
export function SeccionCondiciones({ condiciones, alGuardar }: Props) {
  const edicion = useEdicion(condiciones);
  const [verVistaPrevia, setVerVistaPrevia] = useState(false);
  const { ejecutar, enCurso, error } = useAccionAdmin();
  const { texto } = edicion.borrador;

  /** Guarda el texto de las condiciones. */
  async function guardar() {
    const resultado = await ejecutar(() =>
      pedirAdmin<ContenidoSitio>('/admin/contenido/condiciones', { metodo: 'PUT', cuerpo: { texto } }),
    );
    if (resultado.ok) {
      alGuardar(resultado.valor);
      edicion.confirmarGuardado(resultado.valor.condiciones);
    }
  }

  return (
    <>
      <p className="mb-3 text-xs text-texto-suave">
        Formato: <code>## Subtítulo</code> · <code>- elemento de lista</code> · <code>**negrita**</code> ·{' '}
        <code>[texto](https://link)</code>. Dejá una línea en blanco entre párrafos.
      </p>
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => setVerVistaPrevia(false)}
          aria-pressed={!verVistaPrevia}
          className={verVistaPrevia ? ESTILOS_ADMIN.botonSecundario : ESTILOS_ADMIN.botonPrimario}
        >
          Editar
        </button>
        <button
          type="button"
          onClick={() => setVerVistaPrevia(true)}
          aria-pressed={verVistaPrevia}
          className={verVistaPrevia ? ESTILOS_ADMIN.botonPrimario : ESTILOS_ADMIN.botonSecundario}
        >
          Vista previa
        </button>
      </div>
      {verVistaPrevia ? (
        <div className="min-h-64 rounded-xl border border-borde bg-fondo p-5">
          {texto.trim() ? <TextoMarkdown texto={texto} /> : <p className="text-texto-suave">Sin texto.</p>}
        </div>
      ) : (
        <textarea
          value={texto}
          rows={16}
          maxLength={LARGO_MAXIMO}
          onChange={(evento) => edicion.cambiar({ texto: evento.target.value })}
          aria-label="Condiciones de venta"
          className={`${ESTILOS_ADMIN.campo} font-mono`}
        />
      )}
      <p className="mt-1 text-xs text-texto-suave">
        {texto.length.toLocaleString('es-AR')}/{LARGO_MAXIMO.toLocaleString('es-AR')} caracteres
      </p>
      <PieSeccion
        hayCambios={edicion.hayCambios}
        enCurso={enCurso}
        guardado={edicion.guardado}
        error={error}
        alGuardar={guardar}
      />
    </>
  );
}
