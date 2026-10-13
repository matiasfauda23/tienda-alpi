'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { ErrorDeSesion, pedirAdmin } from './cliente-admin';
import { describirError } from './errores';
import { useSesion } from './sesion';

export type EstadoCarga<T> =
  | { estado: 'cargando' }
  | { estado: 'listo'; datos: T }
  | { estado: 'error'; mensaje: string };

export type ResultadoAccion<R> = { ok: true; valor: R } | { ok: false };

/** Carga datos del panel; si la sesión venció, lleva al login. */
export function useDatosAdmin<T>(ruta: string) {
  const { marcarVencida } = useSesion();
  const [carga, setCarga] = useState<EstadoCarga<T>>({ estado: 'cargando' });
  const [version, setVersion] = useState(0);

  const alFallar = useEffectEvent((error: unknown) => {
    if (error instanceof ErrorDeSesion) marcarVencida();
    else setCarga({ estado: 'error', mensaje: describirError(error) });
  });

  useEffect(() => {
    let vigente = true;
    pedirAdmin<T>(ruta)
      .then((datos) => {
        if (vigente) setCarga({ estado: 'listo', datos });
      })
      .catch((error: unknown) => {
        if (vigente) alFallar(error);
      });
    return () => {
      vigente = false;
    };
  }, [ruta, version]);

  return {
    carga,
    recargar: () => {
      setCarga({ estado: 'cargando' });
      setVersion((actual) => actual + 1);
    },
    reemplazar: (datos: T) => setCarga({ estado: 'listo', datos }),
  };
}

/** Ejecuta cambios (guardar, borrar) con el mismo manejo de errores y sesión en todo el panel. */
export function useAccionAdmin() {
  const { marcarVencida } = useSesion();
  const [enCurso, setEnCurso] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Corre la acción; si falla, guarda el mensaje de error (o lleva al login si venció la sesión). */
  async function ejecutar<R>(accion: () => Promise<R>): Promise<ResultadoAccion<R>> {
    setEnCurso(true);
    setError(null);
    try {
      return { ok: true, valor: await accion() };
    } catch (errorDeAccion) {
      if (errorDeAccion instanceof ErrorDeSesion) marcarVencida();
      else setError(describirError(errorDeAccion));
      return { ok: false };
    } finally {
      setEnCurso(false);
    }
  }

  return { ejecutar, enCurso, error, limpiarError: () => setError(null) };
}
