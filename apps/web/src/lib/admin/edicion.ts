'use client';

import { useState } from 'react';

/** Estado de edición de una sección: borrador, cambios, errores visibles y aviso de guardado. */
export function useEdicion<T>(original: T) {
  const [borrador, setBorrador] = useState(original);
  const [mostrarErrores, setMostrarErrores] = useState(false);
  const [guardado, setGuardado] = useState(false);

  return {
    borrador,
    mostrarErrores,
    guardado,
    hayCambios: JSON.stringify(borrador) !== JSON.stringify(original),
    cambiar: (nuevo: T) => {
      setBorrador(nuevo);
      setGuardado(false);
    },
    intentarGuardar: () => setMostrarErrores(true),
    confirmarGuardado: (valorGuardado: T) => {
      setBorrador(valorGuardado);
      setMostrarErrores(false);
      setGuardado(true);
    },
  };
}
