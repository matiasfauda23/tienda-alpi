import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FormularioIngreso } from '@/componentes/admin/formulario-ingreso';
import { Logo } from '@/componentes/ui/logo';

export const metadata: Metadata = { title: 'Ingresar' };

/** Página de login del panel (la única del panel que no requiere sesión). */
export default function PaginaIngresar() {
  return (
    <main className="flex flex-1 items-center justify-center bg-fondo px-4 py-16">
      <div className="w-full max-w-sm rounded-3xl border border-borde bg-superficie p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo />
          <h1 className="font-titulos text-2xl text-texto">Panel de administración</h1>
        </div>
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-borde/60" />}>
          <FormularioIngreso />
        </Suspense>
      </div>
    </main>
  );
}
