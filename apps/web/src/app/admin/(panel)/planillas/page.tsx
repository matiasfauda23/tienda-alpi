import type { Metadata } from 'next';
import { GestorPlanillas } from '@/componentes/admin/planillas/gestor-planillas';

export const metadata: Metadata = { title: 'Excel' };

/** Página del panel para actualizar precios y stock con una planilla. */
export default function PaginaPlanillasAdmin() {
  return (
    <>
      <h1 className="font-titulos text-3xl text-texto">Precios y stock con Excel</h1>
      <p className="mb-6 mt-2 max-w-2xl text-sm text-texto-suave">
        Ideal para cambios masivos, como un aumento general o la carga de stock después de una producción.
      </p>
      <GestorPlanillas />
    </>
  );
}
