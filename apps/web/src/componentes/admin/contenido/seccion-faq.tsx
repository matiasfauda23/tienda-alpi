'use client';

import type { ContenidoSitio, PreguntaFrecuente } from '@/lib/api/tipos';
import { pedirAdmin } from '@/lib/admin/cliente-admin';
import { moverElemento, validarPregunta } from '@/lib/admin/contenido-admin';
import { useAccionAdmin } from '@/lib/admin/datos';
import { useEdicion } from '@/lib/admin/edicion';
import { hayErrores } from '@/lib/admin/formulario-producto';
import { ESTILOS_ADMIN } from '../comunes';
import { Campo } from '../producto/campo';
import { PieSeccion } from './pie-seccion';

const MAXIMO_PREGUNTAS = 50;
const ESTILO_FLECHA = 'rounded border border-borde px-2 py-0.5 text-sm hover:border-acento disabled:opacity-30';

type Props = { preguntas: PreguntaFrecuente[]; alGuardar: (contenido: ContenidoSitio) => void };

/** Lista de preguntas frecuentes: agregar, editar, reordenar y eliminar. */
export function SeccionFaq({ preguntas, alGuardar }: Props) {
  const edicion = useEdicion(preguntas);
  const { ejecutar, enCurso, error } = useAccionAdmin();
  const lista = edicion.borrador;
  const errores = lista.map(validarPregunta);

  /** Cambia la pregunta o la respuesta de un elemento de la lista. */
  function cambiarItem(indice: number, cambios: Partial<PreguntaFrecuente>) {
    edicion.cambiar(lista.map((item, i) => (i === indice ? { ...item, ...cambios } : item)));
  }

  /** Valida y guarda la lista completa en el orden actual. */
  async function guardar() {
    edicion.intentarGuardar();
    if (errores.some(hayErrores)) return;
    const cuerpo = {
      preguntas: lista.map((item) => ({ pregunta: item.pregunta.trim(), respuesta: item.respuesta.trim() })),
    };
    const resultado = await ejecutar(() =>
      pedirAdmin<ContenidoSitio>('/admin/contenido/faq', { metodo: 'PUT', cuerpo }),
    );
    if (resultado.ok) {
      alGuardar(resultado.valor);
      edicion.confirmarGuardado(resultado.valor.faq.preguntas);
    }
  }

  return (
    <>
      {lista.length === 0 && <p className="text-sm text-texto-suave">Todavía no hay preguntas.</p>}
      <ol className="flex flex-col gap-4">
        {lista.map((item, indice) => {
          const visibles = edicion.mostrarErrores ? errores[indice] : {};
          return (
            <li key={indice} className="rounded-xl border border-borde bg-fondo p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-texto-suave">Pregunta {indice + 1}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Subir"
                    disabled={indice === 0}
                    onClick={() => edicion.cambiar(moverElemento(lista, indice, indice - 1))}
                    className={ESTILO_FLECHA}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Bajar"
                    disabled={indice === lista.length - 1}
                    onClick={() => edicion.cambiar(moverElemento(lista, indice, indice + 1))}
                    className={ESTILO_FLECHA}
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => edicion.cambiar(lista.filter((_, i) => i !== indice))}
                    className={ESTILOS_ADMIN.botonPeligro}
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              <div className="grid gap-3">
                <Campo etiqueta="Pregunta" error={visibles.pregunta}>
                  <input
                    value={item.pregunta}
                    maxLength={200}
                    onChange={(evento) => cambiarItem(indice, { pregunta: evento.target.value })}
                    aria-invalid={Boolean(visibles.pregunta)}
                    className={ESTILOS_ADMIN.campo}
                  />
                </Campo>
                <Campo etiqueta="Respuesta (admite **negrita** y [links](https://...))" error={visibles.respuesta}>
                  <textarea
                    value={item.respuesta}
                    rows={3}
                    maxLength={2000}
                    onChange={(evento) => cambiarItem(indice, { respuesta: evento.target.value })}
                    aria-invalid={Boolean(visibles.respuesta)}
                    className={ESTILOS_ADMIN.campo}
                  />
                </Campo>
              </div>
            </li>
          );
        })}
      </ol>
      {lista.length < MAXIMO_PREGUNTAS && (
        <button
          type="button"
          onClick={() => edicion.cambiar([...lista, { pregunta: '', respuesta: '' }])}
          className={`mt-4 ${ESTILOS_ADMIN.botonSecundario}`}
        >
          + Agregar pregunta
        </button>
      )}
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
