import { compararConLaBase } from './comparar-cambios';
import { FilaLeida, LecturaNumero, VarianteActual } from './planilla.tipos';

const VARIANTE: VarianteActual = {
  id: 'variante-1',
  productoId: 'producto-1',
  sku: 'MATE-NEGRO',
  producto: 'Mate de Acero',
  variante: 'Negro',
  precio: 10000,
  precioOferta: null,
  stock: 50,
};

/** Atajos para armar lecturas de celdas. */
const numero = (valor: number): LecturaNumero => ({ tipo: 'numero', valor });
const vacio: LecturaNumero = { tipo: 'vacio' };

/** Crea una fila de planilla con los mismos valores que VARIANTE, que se pueden pisar. */
function crearFila(datos: Partial<FilaLeida> = {}): FilaLeida {
  return { numero: 2, sku: 'MATE-NEGRO', precio: numero(10000), precioOferta: vacio, stock: numero(50), ...datos };
}

describe('compararConLaBase', () => {
  it('detecta un cambio de precio y stock', () => {
    const resultado = compararConLaBase([crearFila({ precio: numero(11000), stock: numero(40) })], [VARIANTE]);

    expect(resultado.errores).toEqual([]);
    expect(resultado.cambios).toHaveLength(1);
    expect(resultado.cambios[0].antes).toEqual({ precio: 10000, precioOferta: null, stock: 50 });
    expect(resultado.cambios[0].despues).toEqual({ precio: 11000, precioOferta: null, stock: 40 });
  });

  it('cuenta las filas que no cambiaron', () => {
    const resultado = compararConLaBase([crearFila()], [VARIANTE]);

    expect(resultado.cambios).toEqual([]);
    expect(resultado.sinCambios).toBe(1);
  });

  it('una oferta vacía quita la oferta existente', () => {
    const conOferta = { ...VARIANTE, precioOferta: 9000 };

    const resultado = compararConLaBase([crearFila()], [conOferta]);

    expect(resultado.cambios[0].despues.precioOferta).toBeNull();
  });

  it('informa un SKU que no existe', () => {
    const resultado = compararConLaBase([crearFila({ sku: 'NO-EXISTE' })], [VARIANTE]);

    expect(resultado.errores[0]).toEqual({ fila: 2, sku: 'NO-EXISTE', mensaje: 'No existe ninguna variante con ese SKU.' });
  });

  it('informa un SKU repetido en la planilla', () => {
    const resultado = compararConLaBase([crearFila(), crearFila({ numero: 3 })], [VARIANTE]);

    expect(resultado.errores).toHaveLength(1);
    expect(resultado.errores[0].fila).toBe(3);
  });

  it('rechaza una oferta mayor o igual al precio', () => {
    const resultado = compararConLaBase([crearFila({ precioOferta: numero(10000) })], [VARIANTE]);

    expect(resultado.errores[0].mensaje).toContain('debe ser menor');
  });

  it('rechaza un precio vacío o inválido', () => {
    const resultado = compararConLaBase(
      [crearFila({ precio: vacio }), crearFila({ numero: 3, sku: 'OTRO', precio: { tipo: 'invalido', texto: 'diez' } })],
      [VARIANTE, { ...VARIANTE, id: 'variante-2', sku: 'OTRO' }],
    );

    expect(resultado.errores.map((error) => error.mensaje)).toEqual([
      'El precio es obligatorio.',
      'El precio "diez" no es válido: usá un número entero, sin centavos.',
    ]);
  });
});
