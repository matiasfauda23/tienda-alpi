import { describe, expect, it } from 'vitest';
import type { Variante } from '../api/tipos';
import {
  convertirBorradorVariante,
  crearBorradorProducto,
  crearBorradorVariante,
  datosDeVariante,
  diferencias,
  encontrarSkuRepetido,
  esIdValido,
  hayErrores,
  leerEntero,
  soloDigitos,
  validarBorradorProducto,
  validarBorradorVariante,
  type BorradorVariante,
} from './formulario-producto';

const VARIANTE: Variante = {
  id: 'v1',
  sku: 'MATE-NEGRO',
  nombre: 'Negro',
  colorHex: '#1f1f1f',
  precio: 15000,
  precioOferta: null,
  stock: 10,
  orden: 0,
  preciosFijos: [],
};

/** Borrador de variante válido, con cambios opcionales. */
function borrador(cambios: Partial<BorradorVariante> = {}): BorradorVariante {
  return { ...crearBorradorVariante(VARIANTE), ...cambios };
}

describe('lectura de números', () => {
  it('deja solo dígitos y lee enteros', () => {
    expect(soloDigitos('$ 15.000')).toBe('15000');
    expect(leerEntero('15000')).toBe(15000);
    expect(leerEntero('')).toBeNull();
    expect(leerEntero('1.5')).toBeNull();
  });

  it('reconoce ids con formato UUID', () => {
    expect(esIdValido('9d3cd034-16a5-450a-8892-154ee7e9e5c5')).toBe(true);
    expect(esIdValido('../admin')).toBe(false);
  });
});

describe('validarBorradorProducto', () => {
  it('exige nombre y categoría', () => {
    const errores = validarBorradorProducto(crearBorradorProducto());
    expect(errores.nombre).toBeDefined();
    expect(errores.categoriaId).toBeDefined();
    expect(hayErrores(validarBorradorProducto({ ...crearBorradorProducto(), nombre: 'Mate', categoriaId: 'c1' }))).toBe(
      false,
    );
  });
});

describe('validarBorradorVariante', () => {
  it('acepta una variante válida, con el SKU en minúsculas', () => {
    expect(validarBorradorVariante(borrador({ sku: 'mate-negro' }))).toEqual({});
  });

  it('marca cada campo inválido', () => {
    const errores = validarBorradorVariante(
      borrador({ sku: 'MATE NEGRO', nombre: ' ', colorHex: 'rojo', precio: '0', stock: '', orden: '2000' }),
    );
    expect(Object.keys(errores).sort()).toEqual(['colorHex', 'nombre', 'orden', 'precio', 'sku', 'stock']);
  });

  it('exige que la oferta sea menor al precio', () => {
    expect(validarBorradorVariante(borrador({ precioOferta: '15000' })).precioOferta).toBe('Debe ser menor al precio.');
    expect(validarBorradorVariante(borrador({ precioOferta: '12000' }))).toEqual({});
  });
});

describe('conversión y diferencias', () => {
  it('convierte el borrador a los datos de la API', () => {
    expect(convertirBorradorVariante(borrador({ sku: ' mate-negro ', colorHex: '', precioOferta: '' }))).toEqual({
      sku: 'MATE-NEGRO',
      nombre: 'Negro',
      colorHex: null,
      precio: 15000,
      precioOferta: null,
      stock: 10,
      orden: 0,
    });
  });

  it('devuelve solo los campos que cambiaron', () => {
    const editada = convertirBorradorVariante(borrador({ stock: '3', precioOferta: '12000' }));
    expect(diferencias(datosDeVariante(VARIANTE), editada)).toEqual({ stock: 3, precioOferta: 12000 });
    expect(diferencias(datosDeVariante(VARIANTE), convertirBorradorVariante(borrador()))).toEqual({});
  });

  it('detecta SKU repetidos sin importar mayúsculas', () => {
    expect(encontrarSkuRepetido([borrador(), borrador({ sku: 'mate-negro' })])).toBe('MATE-NEGRO');
    expect(encontrarSkuRepetido([borrador(), borrador({ sku: 'MATE-VERDE' })])).toBeNull();
  });
});
