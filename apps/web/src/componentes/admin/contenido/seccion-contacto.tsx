'use client';

import type { Contacto, ContenidoSitio } from '@/lib/api/tipos';
import { pedirAdmin } from '@/lib/admin/cliente-admin';
import { convertirContacto, limpiarWhatsapp, validarContacto } from '@/lib/admin/contenido-admin';
import { useAccionAdmin } from '@/lib/admin/datos';
import { useEdicion } from '@/lib/admin/edicion';
import { hayErrores } from '@/lib/admin/formulario-producto';
import { crearEnlaceWhatsApp } from '@/lib/whatsapp';
import { ESTILOS_ADMIN } from '../comunes';
import { Campo } from '../producto/campo';
import { PieSeccion } from './pie-seccion';

type Props = { contacto: Contacto; alGuardar: (contenido: ContenidoSitio) => void };

/** WhatsApp, email y redes sociales del negocio. */
export function SeccionContacto({ contacto, alGuardar }: Props) {
  const edicion = useEdicion(contacto);
  const { ejecutar, enCurso, error } = useAccionAdmin();
  const { borrador } = edicion;
  const errores = validarContacto(borrador);
  const visibles = edicion.mostrarErrores ? errores : {};

  /** Cambia un campo del contacto manteniendo el resto. */
  function cambiar(campo: keyof Contacto, valor: string) {
    edicion.cambiar({ ...borrador, [campo]: valor });
  }

  /** Valida y guarda los datos de contacto. */
  async function guardar() {
    edicion.intentarGuardar();
    if (hayErrores(errores)) return;
    const resultado = await ejecutar(() =>
      pedirAdmin<ContenidoSitio>('/admin/contenido/contacto', { metodo: 'PUT', cuerpo: convertirContacto(borrador) }),
    );
    if (resultado.ok) {
      alGuardar(resultado.valor);
      edicion.confirmarGuardado(resultado.valor.contacto);
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Campo etiqueta="WhatsApp (con código de país, sin 0 ni 15)" error={visibles.whatsapp}>
          <input
            inputMode="tel"
            value={borrador.whatsapp}
            onChange={(evento) => cambiar('whatsapp', evento.target.value)}
            placeholder="5491178254471"
            aria-invalid={Boolean(visibles.whatsapp)}
            className={ESTILOS_ADMIN.campo}
          />
          {!errores.whatsapp && (
            <a
              href={crearEnlaceWhatsApp(limpiarWhatsapp(borrador.whatsapp), 'Prueba desde el panel')}
              target="_blank"
              rel="noopener noreferrer"
              className="font-normal text-acento-oscuro underline"
            >
              Probar el número
            </a>
          )}
        </Campo>
        <Campo etiqueta="Email (opcional)" error={visibles.email}>
          <input
            type="email"
            value={borrador.email}
            onChange={(evento) => cambiar('email', evento.target.value)}
            aria-invalid={Boolean(visibles.email)}
            className={ESTILOS_ADMIN.campo}
          />
        </Campo>
        <Campo etiqueta="Instagram (opcional, sin @)" error={visibles.instagram}>
          <input
            value={borrador.instagram}
            onChange={(evento) => cambiar('instagram', evento.target.value)}
            placeholder="tienda_alpi"
            aria-invalid={Boolean(visibles.instagram)}
            className={ESTILOS_ADMIN.campo}
          />
        </Campo>
        <Campo etiqueta="TikTok (opcional, sin @)" error={visibles.tiktok}>
          <input
            value={borrador.tiktok}
            onChange={(evento) => cambiar('tiktok', evento.target.value)}
            aria-invalid={Boolean(visibles.tiktok)}
            className={ESTILOS_ADMIN.campo}
          />
        </Campo>
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
