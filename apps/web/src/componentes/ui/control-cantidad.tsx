'use client';

import { useState, type KeyboardEvent } from 'react';

type Props = { cantidad: number; etiqueta: string; alCambiar: (cantidad: number) => void };

const ESTILO_BOTON =
  'flex size-9 items-center justify-center text-lg text-texto transition hover:text-acento-oscuro disabled:opacity-40';

/** Control de cantidad con − y +; lo escrito se confirma al salir del campo o con Enter. */
export function ControlCantidad({ cantidad, etiqueta, alCambiar }: Props) {
  const [texto, setTexto] = useState(String(cantidad));
  const [cantidadAnterior, setCantidadAnterior] = useState(cantidad);
  if (cantidad !== cantidadAnterior) {
    setCantidadAnterior(cantidad);
    setTexto(String(cantidad));
  }

  /** Confirma lo escrito si es un número válido; si no, vuelve al valor anterior. */
  function confirmar() {
    const numero = Number(texto);
    if (texto !== '' && numero >= 1) alCambiar(numero);
    else setTexto(String(cantidad));
  }

  /** Con Enter confirma sin enviar ningún formulario. */
  function alPresionarTecla(evento: KeyboardEvent<HTMLInputElement>) {
    if (evento.key !== 'Enter') return;
    evento.preventDefault();
    confirmar();
  }

  return (
    <div className="inline-flex items-center rounded-full border border-borde bg-superficie">
      <button
        type="button"
        aria-label="Restar una unidad"
        disabled={cantidad <= 1}
        onClick={() => alCambiar(cantidad - 1)}
        className={ESTILO_BOTON}
      >
        −
      </button>
      <input
        type="text"
        inputMode="numeric"
        aria-label={etiqueta}
        value={texto}
        onChange={(evento) => setTexto(evento.target.value.replace(/\D/g, '').slice(0, 4))}
        onBlur={confirmar}
        onKeyDown={alPresionarTecla}
        className="w-14 bg-transparent text-center text-sm font-semibold text-texto focus:outline-none"
      />
      <button
        type="button"
        aria-label="Sumar una unidad"
        onClick={() => alCambiar(cantidad + 1)}
        className={ESTILO_BOTON}
      >
        +
      </button>
    </div>
  );
}
