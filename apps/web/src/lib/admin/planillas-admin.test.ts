import { describe, expect, it } from 'vitest';
import { armarNombreDescarga, camposModificados, validarArchivoPlanilla } from './planillas-admin';

describe('validarArchivoPlanilla', () => {
  it('acepta un .xlsx chico, sin importar mayúsculas', () => {
    expect(validarArchivoPlanilla({ name: 'Precios.XLSX', size: 5000 })).toBeNull();
  });

  it('rechaza otros formatos, vacíos y archivos grandes', () => {
    expect(validarArchivoPlanilla({ name: 'precios.csv', size: 5000 })).toContain('.xlsx');
    expect(validarArchivoPlanilla({ name: 'precios.xlsx', size: 0 })).toContain('vacío');
    expect(validarArchivoPlanilla({ name: 'precios.xlsx', size: 3 * 1024 * 1024 })).toContain('2 MB');
  });
});

describe('armarNombreDescarga', () => {
  it('usa la fecha local aunque en UTC ya sea el día siguiente', () => {
    expect(armarNombreDescarga(new Date(2026, 9, 13, 23, 30))).toBe('tienda-alpi-precios-2026-10-13.xlsx');
  });
});

describe('camposModificados', () => {
  it('devuelve solo los valores que cambian', () => {
    const cambio = {
      varianteId: 'v',
      productoId: 'p',
      sku: 'MATE',
      producto: 'Mate',
      variante: 'Negro',
      antes: { precio: 10000, precioOferta: null, stock: 5 },
      despues: { precio: 11000, precioOferta: null, stock: 8 },
    };
    expect(camposModificados(cambio)).toEqual(['precio', 'stock']);
  });
});
