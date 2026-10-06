import { BadRequestException } from '@nestjs/common';
import { Workbook } from 'exceljs';
import { generarPlanilla } from './escribir-planilla';
import { leerPlanilla } from './leer-planilla';

describe('leerPlanilla', () => {
  it('lee la misma planilla que genera la exportación (ida y vuelta)', async () => {
    const archivo = await generarPlanilla([
      { sku: 'MATE-NEGRO', categoria: 'Mates', producto: 'Mate de Acero', variante: 'Negro', precio: 10000, precioOferta: 9000, stock: 50 },
      { sku: 'MATE-VERDE', categoria: 'Mates', producto: 'Mate de Acero', variante: 'Verde', precio: 10000, precioOferta: null, stock: 3 },
    ]);

    const filas = await leerPlanilla(archivo);

    expect(filas).toEqual([
      { numero: 2, sku: 'MATE-NEGRO', precio: { tipo: 'numero', valor: 10000 }, precioOferta: { tipo: 'numero', valor: 9000 }, stock: { tipo: 'numero', valor: 50 } },
      { numero: 3, sku: 'MATE-VERDE', precio: { tipo: 'numero', valor: 10000 }, precioOferta: { tipo: 'vacio' }, stock: { tipo: 'numero', valor: 3 } },
    ]);
  });

  it('rechaza un archivo que no es .xlsx aunque tenga esa extensión', async () => {
    await expect(leerPlanilla(Buffer.from('esto no es una planilla'))).rejects.toThrow(BadRequestException);
  });

  it('rechaza una planilla a la que le falta una columna', async () => {
    const libro = new Workbook();
    libro.addWorksheet('Hoja').addRow(['SKU', 'Precio']);
    const archivo = Buffer.from(await libro.xlsx.writeBuffer());

    await expect(leerPlanilla(archivo)).rejects.toThrow('Falta la columna "Precio oferta"');
  });
});
