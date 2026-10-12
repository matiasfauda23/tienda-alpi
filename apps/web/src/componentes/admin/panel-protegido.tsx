'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useSesion } from '@/lib/admin/sesion';
import { RUTA_INGRESO } from '@/lib/admin/utilidades';
import { EncabezadoAdmin } from './encabezado-admin';

/** Muestra el panel solo con sesión activa; sin sesión, lleva al login recordando la página. */
export function PanelProtegido({ children }: { children: ReactNode }) {
  const { sesion, reintentar } = useSesion();
  const router = useRouter();
  const rutaActual = usePathname();

  useEffect(() => {
    if (sesion.estado === 'inactiva') {
      router.replace(`${RUTA_INGRESO}?volver=${encodeURIComponent(rutaActual)}`);
    }
  }, [sesion.estado, router, rutaActual]);

  if (sesion.estado === 'activa') {
    return (
      <>
        <EncabezadoAdmin email={sesion.administrador.email} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
      </>
    );
  }

  if (sesion.estado === 'error') {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-4 px-4 text-center">
        <p className="font-titulos text-xl text-texto">No se pudo conectar con el servidor</p>
        <p className="text-sm text-texto-suave">Puede estar iniciando. Esperá unos segundos y reintentá.</p>
        <button
          type="button"
          onClick={reintentar}
          className="rounded-full bg-acento px-6 py-2.5 font-semibold text-white hover:bg-acento-oscuro"
        >
          Reintentar
        </button>
      </main>
    );
  }

  return (
    <main className="flex flex-1 items-center justify-center text-texto-suave" aria-busy="true">
      Verificando sesión…
    </main>
  );
}
