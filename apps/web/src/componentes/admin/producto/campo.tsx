import type { ReactNode } from 'react';

export const ESTILO_TARJETA = 'rounded-2xl border border-borde bg-superficie p-5';

type Props = { etiqueta: string; error?: string; children: ReactNode; className?: string };

/** Etiqueta, campo y mensaje de error con el estilo del panel. */
export function Campo({ etiqueta, error, children, className = '' }: Props) {
  return (
    <label className={`flex flex-col gap-1 text-xs font-semibold text-texto-suave ${className}`}>
      {etiqueta}
      {children}
      {error && <span className="font-normal text-oferta">{error}</span>}
    </label>
  );
}
