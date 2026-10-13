import { describe, expect, it } from 'vitest';
import { esTokenValido, leerEtiquetas } from './revalidacion';

const SECRETO = 'a'.repeat(64);

describe('leerEtiquetas', () => {
  it('se queda solo con las etiquetas conocidas, sin repetir', () => {
    expect(leerEtiquetas({ etiquetas: ['productos', 'productos', 'contenido', 'inventada', 42] })).toEqual([
      'productos',
      'contenido',
    ]);
  });

  it('devuelve vacío si el cuerpo no tiene la forma esperada', () => {
    expect(leerEtiquetas(null)).toEqual([]);
    expect(leerEtiquetas({ etiquetas: 'productos' })).toEqual([]);
    expect(leerEtiquetas('texto')).toEqual([]);
  });
});

describe('esTokenValido', () => {
  it('acepta el secreto correcto', () => {
    expect(esTokenValido(`Bearer ${SECRETO}`, SECRETO)).toBe(true);
  });

  it('rechaza secretos incorrectos, encabezados mal formados y secretos cortos', () => {
    expect(esTokenValido(`Bearer ${'b'.repeat(64)}`, SECRETO)).toBe(false);
    expect(esTokenValido(`Bearer ${SECRETO}x`, SECRETO)).toBe(false);
    expect(esTokenValido(SECRETO, SECRETO)).toBe(false);
    expect(esTokenValido(null, SECRETO)).toBe(false);
    expect(esTokenValido('Bearer corto', 'corto')).toBe(false);
    expect(esTokenValido(`Bearer ${SECRETO}`, undefined)).toBe(false);
  });
});
