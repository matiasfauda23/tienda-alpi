import type { ReactNode } from 'react';

const ESTILOS_POR_TONO = {
  oferta: 'bg-oferta text-white',
  acento: 'bg-acento text-white',
  aviso: 'bg-acento-suave text-acento-tinta',
  neutro: 'bg-borde text-texto-suave',
} as const;

type Props = { tono: keyof typeof ESTILOS_POR_TONO; children: ReactNode };

/** Etiqueta chica para destacar estados como "Oferta" o "Últimas unidades". */
export function Etiqueta({ tono, children }: Props) {
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${ESTILOS_POR_TONO[tono]}`}>
      {children}
    </span>
  );
}
