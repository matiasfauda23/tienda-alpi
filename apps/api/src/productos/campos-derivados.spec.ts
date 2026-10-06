import { calcularCamposDerivados, calcularPrecioDesde } from './campos-derivados';

describe('calcularPrecioDesde', () => {
  it('toma el precio más bajo entre las variantes', () => {
    const variantes = [
      { precio: 12000, precioOferta: null },
      { precio: 10000, precioOferta: null },
    ];
    expect(calcularPrecioDesde(variantes)).toBe(10000);
  });

  it('usa la oferta cuando existe', () => {
    const variantes = [
      { precio: 10000, precioOferta: 9000 },
      { precio: 9500, precioOferta: null },
    ];
    expect(calcularPrecioDesde(variantes)).toBe(9000);
  });

  it('devuelve 0 si no hay variantes', () => {
    expect(calcularPrecioDesde([])).toBe(0);
  });
});

describe('calcularCamposDerivados', () => {
  it('arma el texto de búsqueda sin tildes, en minúsculas y con las variantes', () => {
    const campos = calcularCamposDerivados({
      nombre: 'Mate Térmico',
      descripcion: 'Doble   pared',
      variantes: [{ nombre: 'Negro', sku: 'MATE-NEG', precio: 10000, precioOferta: null }],
    });

    expect(campos.textoBusqueda).toBe('mate termico doble pared negro mate-neg');
    expect(campos.precioDesde).toBe(10000);
  });
});
