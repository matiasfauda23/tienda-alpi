import { Workbook } from 'exceljs';
import { FilaExportada } from './planilla.tipos';

/** Encabezados de la planilla. Al importar, las columnas se buscan por estos nombres. */
export const ENCABEZADOS = {
  sku: 'SKU',
  categoria: 'Categoría',
  producto: 'Producto',
  variante: 'Variante',
  precio: 'Precio',
  precioOferta: 'Precio oferta',
  stock: 'Stock',
} as const;

/** Genera el archivo .xlsx con una fila por variante. */
export async function generarPlanilla(filas: FilaExportada[]): Promise<Buffer> {
  const libro = new Workbook();
  libro.creator = 'Tienda Alpi';

  // La fila de encabezados queda fija al bajar por la planilla
  const hoja = libro.addWorksheet('Precios y stock', { views: [{ state: 'frozen', ySplit: 1 }] });

  hoja.columns = [
    { header: ENCABEZADOS.sku, key: 'sku', width: 22 },
    { header: ENCABEZADOS.categoria, key: 'categoria', width: 16 },
    { header: ENCABEZADOS.producto, key: 'producto', width: 34 },
    { header: ENCABEZADOS.variante, key: 'variante', width: 18 },
    { header: ENCABEZADOS.precio, key: 'precio', width: 12 },
    { header: ENCABEZADOS.precioOferta, key: 'precioOferta', width: 14 },
    { header: ENCABEZADOS.stock, key: 'stock', width: 10 },
  ];

  hoja.addRows(filas);
  hoja.getRow(1).font = { bold: true };

  // Precios con separador de miles y sin decimales
  hoja.getColumn('precio').numFmt = '#,##0';
  hoja.getColumn('precioOferta').numFmt = '#,##0';

  return Buffer.from(await libro.xlsx.writeBuffer());
}
