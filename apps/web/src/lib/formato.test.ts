import { describe, expect, it } from 'vitest';
import { formatearPrecio } from './formato';

/** Intl usa un espacio especial (no separable) entre "$" y el número: lo normalizamos para comparar. */
const normalizarEspacios = (texto: string) => texto.replace(/\s/g, ' ');

describe('formatearPrecio', () => {
  it('usa punto de miles y no muestra centavos', () => {
    expect(normalizarEspacios(formatearPrecio(10000))).toBe('$ 10.000');
    expect(normalizarEspacios(formatearPrecio(1234567))).toBe('$ 1.234.567');
  });
});
