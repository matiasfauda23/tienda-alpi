import { leerEntero, leerTexto } from './interpretar-celdas';

describe('leerEntero', () => {
  it.each([
    [10000, 10000],
    ['10000', 10000],
    ['10.000', 10000],
    ['$ 12.500', 12500],
    ['1.234.567', 1234567],
    [{ formula: 'B2*2', result: 2000 }, 2000],
  ])('lee %p como %p', (celda, esperado) => {
    expect(leerEntero(celda)).toEqual({ tipo: 'numero', valor: esperado });
  });

  it.each([null, undefined, '', '   '])('trata %p como vacío', (celda) => {
    expect(leerEntero(celda)).toEqual({ tipo: 'vacio' });
  });

  it.each([10.5, '10,50', 'diez', '-5', '10.5'])('rechaza %p', (celda) => {
    expect(leerEntero(celda).tipo).toBe('invalido');
  });
});

describe('leerTexto', () => {
  it('une las partes de un texto con formato', () => {
    expect(leerTexto({ richText: [{ text: 'MATE-' }, { text: 'NEGRO ' }] })).toBe('MATE-NEGRO');
  });

  it('devuelve vacío si la celda está vacía', () => {
    expect(leerTexto(null)).toBe('');
  });
});
