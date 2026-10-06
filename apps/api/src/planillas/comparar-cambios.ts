import {
  ComparacionPlanilla,
  FilaLeida,
  LecturaNumero,
  ValoresVariante,
  VarianteActual,
} from './planilla.tipos';

const PRECIO_MAXIMO = 100_000_000;
const STOCK_MAXIMO = 1_000_000;

/** Compara cada fila de la planilla con la variante guardada: arma la lista de cambios y la de errores. */
export function compararConLaBase(filas: FilaLeida[], variantes: VarianteActual[]): ComparacionPlanilla {
  const variantesPorSku = new Map(variantes.map((variante) => [variante.sku, variante]));
  const skusVistos = new Set<string>();
  const resultado: ComparacionPlanilla = { cambios: [], errores: [], sinCambios: 0 };

  for (const fila of filas) {
    const agregarError = (mensaje: string) =>
      resultado.errores.push({ fila: fila.numero, sku: fila.sku, mensaje });

    if (skusVistos.has(fila.sku)) {
      agregarError('El SKU está repetido en la planilla.');
      continue;
    }
    skusVistos.add(fila.sku);

    const actual = variantesPorSku.get(fila.sku);
    if (!actual) {
      agregarError('No existe ninguna variante con ese SKU.');
      continue;
    }

    const nuevos = interpretarValores(fila);
    if (typeof nuevos === 'string') {
      agregarError(nuevos);
      continue;
    }

    if (sonIguales(actual, nuevos)) {
      resultado.sinCambios++;
      continue;
    }

    resultado.cambios.push({
      varianteId: actual.id,
      productoId: actual.productoId,
      sku: actual.sku,
      producto: actual.producto,
      variante: actual.variante,
      antes: { precio: actual.precio, precioOferta: actual.precioOferta, stock: actual.stock },
      despues: nuevos,
    });
  }

  return resultado;
}

/** Convierte una fila en precio, oferta y stock válidos; si algo está mal, devuelve el mensaje de error. */
export function interpretarValores(fila: FilaLeida): ValoresVariante | string {
  const precio = exigirEntero(fila.precio, 'precio', 1, PRECIO_MAXIMO);
  if (typeof precio === 'string') {
    return precio;
  }

  const stock = exigirEntero(fila.stock, 'stock', 0, STOCK_MAXIMO);
  if (typeof stock === 'string') {
    return stock;
  }

  // La oferta es opcional: vacía significa "sin oferta"
  if (fila.precioOferta.tipo === 'vacio') {
    return { precio, precioOferta: null, stock };
  }

  const precioOferta = exigirEntero(fila.precioOferta, 'precio de oferta', 1, PRECIO_MAXIMO);
  if (typeof precioOferta === 'string') {
    return precioOferta;
  }
  if (precioOferta >= precio) {
    return `El precio de oferta ($${precioOferta}) debe ser menor que el precio ($${precio}).`;
  }

  return { precio, precioOferta, stock };
}

/** Exige que una lectura sea un entero dentro del rango; si no, devuelve el mensaje de error. */
function exigirEntero(lectura: LecturaNumero, nombre: string, minimo: number, maximo: number): number | string {
  if (lectura.tipo === 'vacio') {
    return `El ${nombre} es obligatorio.`;
  }
  if (lectura.tipo === 'invalido') {
    return `El ${nombre} "${lectura.texto}" no es válido: usá un número entero, sin centavos.`;
  }
  if (lectura.valor < minimo || lectura.valor > maximo) {
    return `El ${nombre} debe estar entre ${minimo} y ${maximo}.`;
  }
  return lectura.valor;
}

/** Indica si los valores nuevos son iguales a los guardados. */
function sonIguales(actual: ValoresVariante, nuevos: ValoresVariante): boolean {
  return (
    actual.precio === nuevos.precio &&
    actual.precioOferta === nuevos.precioOferta &&
    actual.stock === nuevos.stock
  );
}
