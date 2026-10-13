'use client';

import type { Banner, ContenidoSitio } from '@/lib/api/tipos';
import { pedirAdmin } from '@/lib/admin/cliente-admin';
import { validarBanner } from '@/lib/admin/contenido-admin';
import { useAccionAdmin } from '@/lib/admin/datos';
import { useEdicion } from '@/lib/admin/edicion';
import { hayErrores } from '@/lib/admin/formulario-producto';
import { ESTILOS_ADMIN } from '../comunes';
import { Campo } from '../producto/campo';
import { PieSeccion } from './pie-seccion';

type Props = { banner: Banner; alGuardar: (contenido: ContenidoSitio) => void };

/** Banner del inicio: título, subtítulo, visibilidad y una vista previa. */
export function SeccionBanner({ banner, alGuardar }: Props) {
  const edicion = useEdicion(banner);
  const { ejecutar, enCurso, error } = useAccionAdmin();
  const { borrador } = edicion;
  const errores = validarBanner(borrador);
  const visibles = edicion.mostrarErrores ? errores : {};

  /** Valida y guarda el banner. */
  async function guardar() {
    edicion.intentarGuardar();
    if (hayErrores(errores)) return;
    const cuerpo = { visible: borrador.visible, titulo: borrador.titulo.trim(), subtitulo: borrador.subtitulo.trim() };
    const resultado = await ejecutar(() =>
      pedirAdmin<ContenidoSitio>('/admin/contenido/banner', { metodo: 'PUT', cuerpo }),
    );
    if (resultado.ok) {
      alGuardar(resultado.valor);
      edicion.confirmarGuardado(resultado.valor.banner);
    }
  }

  return (
    <>
      <div className="grid gap-4">
        <label className="flex items-center gap-2 text-sm text-texto">
          <input
            type="checkbox"
            checked={borrador.visible}
            onChange={(evento) => edicion.cambiar({ ...borrador, visible: evento.target.checked })}
            className="size-4 accent-acento"
          />
          Mostrar el banner en el inicio (si no, se usan los textos por defecto)
        </label>
        <Campo etiqueta={`Título (${borrador.titulo.length}/80)`} error={visibles.titulo}>
          <input
            value={borrador.titulo}
            maxLength={80}
            onChange={(evento) => edicion.cambiar({ ...borrador, titulo: evento.target.value })}
            aria-invalid={Boolean(visibles.titulo)}
            className={ESTILOS_ADMIN.campo}
          />
        </Campo>
        <Campo etiqueta={`Subtítulo (${borrador.subtitulo.length}/160, opcional)`} error={visibles.subtitulo}>
          <input
            value={borrador.subtitulo}
            maxLength={160}
            onChange={(evento) => edicion.cambiar({ ...borrador, subtitulo: evento.target.value })}
            className={ESTILOS_ADMIN.campo}
          />
        </Campo>
        <div className={`rounded-2xl bg-acento-suave p-6 ${borrador.visible ? '' : 'opacity-50'}`} aria-hidden="true">
          <p className="mb-1 text-xs uppercase tracking-wide text-acento-tinta">Vista previa</p>
          <p className="font-titulos text-2xl text-texto">{borrador.titulo || 'Título del banner'}</p>
          {borrador.subtitulo && <p className="mt-1 text-texto-suave">{borrador.subtitulo}</p>}
        </div>
      </div>
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
