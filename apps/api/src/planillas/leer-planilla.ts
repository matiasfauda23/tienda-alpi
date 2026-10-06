import { BadRequestException } from '@nestjs/common';
import { Row, Workbook, Worksheet } from 'exceljs';
import { normalizarTexto } from '../comun/utilidades/texto';
import { ENCABEZADOS } from './escribir-planilla';
import { leerEntero, leerTexto } from './interpretar-celdas';
import { FilaLeida } from './planilla.tipos';

/** Máximo de filas que se aceptan (evita planillas gigantes). */
export const MAXIMO_FILAS = 2000;

/** Todo archivo .xlsx es en realidad un ZIP, y todo ZIP empieza con estos 4 bytes ("PK\x03\x04"). */
const FIRMA_ZIP = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

/** Columnas que la importación necesita sí o sí. */
type ColumnaRequerida = 'sku' | 'precio' | 'precioOferta' | 'stock';

/** Abre la planilla y devuelve una fila por cada renglón que tenga SKU (los renglones vacíos se saltean). */
export async function leerPlanilla(contenido: Buffer): Promise<FilaLeida[]> {
  verificarQueSeaXlsx(contenido);

  const hoja = await abrirPrimeraHoja(contenido);
  const columnas = ubicarColumnas(hoja.getRow(1));

  if (hoja.actualRowCount - 1 > MAXIMO_FILAS) {
    throw new BadRequestException(`La planilla no puede tener más de ${MAXIMO_FILAS} filas.`);
  }

  const filas: FilaLeida[] = [];
  hoja.eachRow((fila, numero) => {
    if (numero === 1) {
      return; // Encabezados
    }

    const sku = leerTexto(fila.getCell(columnas.sku).value).toUpperCase();
    if (!sku) {
      return; // Renglón vacío
    }

    filas.push({
      numero,
      sku,
      precio: leerEntero(fila.getCell(columnas.precio).value),
      precioOferta: leerEntero(fila.getCell(columnas.precioOferta).value),
      stock: leerEntero(fila.getCell(columnas.stock).value),
    });
  });

  return filas;
}

/** Verifica por su contenido (no por la extensión) que el archivo sea un .xlsx. */
function verificarQueSeaXlsx(contenido: Buffer): void {
  if (!contenido.subarray(0, FIRMA_ZIP.length).equals(FIRMA_ZIP)) {
    throw new BadRequestException('El archivo no es una planilla .xlsx válida.');
  }
}

/** Abre el archivo con ExcelJS y devuelve su primera hoja. */
async function abrirPrimeraHoja(contenido: Buffer): Promise<Worksheet> {
  const libro = new Workbook();

  try {
    // Los tipos de ExcelJS declaran su propio "Buffer"; en ejecución acepta el de Node sin problema
    await libro.xlsx.load(contenido as unknown as Parameters<typeof libro.xlsx.load>[0]);
  } catch {
    throw new BadRequestException('No se pudo leer el archivo. Verificá que sea una planilla .xlsx.');
  }

  const hoja = libro.worksheets[0];
  if (!hoja) {
    throw new BadRequestException('La planilla no tiene hojas.');
  }
  return hoja;
}

/** Busca en qué columna está cada encabezado necesario (sin importar el orden ni las tildes). */
function ubicarColumnas(encabezados: Row): Record<ColumnaRequerida, number> {
  const posiciones = new Map<string, number>();
  encabezados.eachCell((celda, columna) => {
    posiciones.set(normalizarTexto(leerTexto(celda.value)), columna);
  });

  const buscar = (clave: ColumnaRequerida): number => {
    const posicion = posiciones.get(normalizarTexto(ENCABEZADOS[clave]));
    if (!posicion) {
      throw new BadRequestException(
        `Falta la columna "${ENCABEZADOS[clave]}". Usá la planilla exportada desde el panel.`,
      );
    }
    return posicion;
  };

  return {
    sku: buscar('sku'),
    precio: buscar('precio'),
    precioOferta: buscar('precioOferta'),
    stock: buscar('stock'),
  };
}
