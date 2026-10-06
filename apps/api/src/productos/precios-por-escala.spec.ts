import { buscarErrorEnPreciosPorEscala, calcularPreciosPorEscala } from './precios-por-escala';

const ESCALAS = [
  { id: 'e1', nombre: 'Minorista', cantidadMinima: 1, porcentajeDescuento: 0 },
  { id: 'e2', nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 10 },
  { id: 'e3', nombre: 'Distribuidor', cantidadMinima: 500, porcentajeDescuento: 20 },
];

describe('calcularPreciosPorEscala', () => {
  it('usa el precio fijo donde existe y el porcentaje en el resto', () => {
    const precios = calcularPreciosPorEscala(10000, ESCALAS, new Map([['e2', 8500]]));

    expect(precios.map((item) => item.precio)).toEqual([10000, 8500, 8000]);
  });
});

describe('buscarErrorEnPreciosPorEscala', () => {
  it('no encuentra errores si los precios bajan al subir de escala', () => {
    expect(buscarErrorEnPreciosPorEscala(10000, ESCALAS, new Map([['e2', 8500]]))).toBeNull();
  });

  it('detecta que el precio sube al pasar a una escala mayor', () => {
    // Mayorista queda en $9.000 (10 %), y un fijo de $9.500 en Distribuidor sería más caro
    const error = buscarErrorEnPreciosPorEscala(10000, ESCALAS, new Map([['e3', 9500]]));

    expect(error).toContain('Distribuidor');
  });

  it('detecta un precio fijo mayor que el precio de lista', () => {
    const error = buscarErrorEnPreciosPorEscala(10000, ESCALAS, new Map([['e1', 12000]]));

    expect(error).toContain('precio de lista');
  });
});
