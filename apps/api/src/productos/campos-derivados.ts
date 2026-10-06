import { normalizarTexto } from '../comun/utilidades/texto';
import { CamposDerivados } from './producto.tipos';

/** Precio de una variante: el normal y, si la tiene, la oferta. */
interface PrecioDeVariante {
  precio: number;
  precioOferta: number | null;
}

/** Datos mínimos de un producto necesarios para calcular sus campos derivados. */
export interface ProductoParaDerivar {
  nombre: string;
  descripcion: string;
  variantes: (PrecioDeVariante & { nombre: string; sku: string })[];
}

/** Devuelve el precio por unidad más bajo entre las variantes, usando la oferta cuando existe. */
export function calcularPrecioDesde(variantes: PrecioDeVariante[]): number {
  if (variantes.length === 0) {
    return 0;
  }
  return Math.min(...variantes.map((variante) => variante.precioOferta ?? variante.precio));
}

/** Arma el texto donde se busca: nombre, descripción, variantes y SKU, sin tildes y en minúsculas. */
export function construirTextoBusqueda(producto: ProductoParaDerivar): string {
  const partes = [
    producto.nombre,
    producto.descripcion,
    ...producto.variantes.flatMap((variante) => [variante.nombre, variante.sku]),
  ];
  return normalizarTexto(partes.join(' '));
}

/** Calcula todos los campos derivados de un producto. */
export function calcularCamposDerivados(producto: ProductoParaDerivar): CamposDerivados {
  return {
    precioDesde: calcularPrecioDesde(producto.variantes),
    textoBusqueda: construirTextoBusqueda(producto),
  };
}
