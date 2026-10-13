import { describe, expect, it } from 'vitest';
import {
  buscarErrorEnConjunto,
  convertirBorradoresEscalas,
  crearBorradoresEscalas,
  crearBorradorEscalaNueva,
  sonDistintasEscalas,
  validarBorradorEscala,
} from './escalas-admin';

const ESCALAS = [
  { id: 'e3', nombre: 'Distribuidor', cantidadMinima: 500, porcentajeDescuento: 20 },
  { id: 'e1', nombre: 'Minorista', cantidadMinima: 1, porcentajeDescuento: 0 },
  { id: 'e2', nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 15 },
];

describe('borradores de escalas', () => {
  it('los ordena de menor a mayor cantidad', () => {
    expect(crearBorradoresEscalas(ESCALAS).map((b) => b.nombre)).toEqual(['Minorista', 'Mayorista', 'Distribuidor']);
  });

  it('sugiere el doble de la cantidad más alta para una nueva', () => {
    expect(crearBorradorEscalaNueva(crearBorradoresEscalas(ESCALAS)).cantidadMinima).toBe('1000');
    expect(crearBorradorEscalaNueva([]).cantidadMinima).toBe('1');
  });

  it('valida cada campo con las reglas de la API', () => {
    const errores = validarBorradorEscala({ clave: 'x', nombre: 'A', cantidadMinima: '0', porcentajeDescuento: '100' });
    expect(Object.keys(errores).sort()).toEqual(['cantidadMinima', 'nombre', 'porcentajeDescuento']);
  });
});

describe('conversión y validación del conjunto', () => {
  it('manda id solo en las escalas existentes', () => {
    const nueva = { clave: 'n', nombre: ' Mega ', cantidadMinima: '1000', porcentajeDescuento: '25' };
    const convertidas = convertirBorradoresEscalas([...crearBorradoresEscalas(ESCALAS), nueva]);
    expect(convertidas.at(-1)).toEqual({ nombre: 'Mega', cantidadMinima: 1000, porcentajeDescuento: 25 });
    expect(convertidas[0]).toHaveProperty('id', 'e1');
  });

  it('usa la validación del paquete de precios', () => {
    expect(buscarErrorEnConjunto(ESCALAS)).toBeNull();
    expect(buscarErrorEnConjunto([])).not.toBeNull();
  });

  it('detecta cambios sin importar el orden', () => {
    expect(sonDistintasEscalas(ESCALAS, [...ESCALAS].reverse())).toBe(false);
    expect(sonDistintasEscalas(ESCALAS, ESCALAS.slice(1))).toBe(true);
  });
});
