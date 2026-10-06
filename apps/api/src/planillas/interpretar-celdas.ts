import { LecturaNumero } from './planilla.tipos';

/** Indica si un valor es un objeto común (no null, no lista). */
function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor);
}

/**
 * Devuelve el valor simple de una celda de ExcelJS:
 * si es una fórmula, su resultado; si es texto con formato o un link, solo el texto.
 */
export function valorPlano(valor: unknown): string | number | null {
  if (valor === null || valor === undefined) {
    return null;
  }
  if (typeof valor === 'number' || typeof valor === 'string') {
    return valor;
  }
  if (typeof valor === 'boolean' || valor instanceof Date) {
    return String(valor);
  }
  if (esObjeto(valor)) {
    if ('result' in valor) {
      return valorPlano(valor.result); // Fórmula: se usa el resultado que muestra Excel
    }
    if (Array.isArray(valor.richText)) {
      return valor.richText.map((parte: { text?: string }) => parte.text ?? '').join(''); // Texto con formato
    }
    if ('text' in valor) {
      return valorPlano(valor.text); // Link
    }
  }
  return null;
}

/** Lee una celda como texto, sin espacios al principio ni al final. */
export function leerTexto(valor: unknown): string {
  const plano = valorPlano(valor);
  return plano === null ? '' : String(plano).trim();
}

/** Lee una celda como número entero. Acepta "10000", "10.000" y "$ 10.000"; rechaza decimales como "10,50". */
export function leerEntero(valor: unknown): LecturaNumero {
  const plano = valorPlano(valor);

  if (plano === null || (typeof plano === 'string' && plano.trim() === '')) {
    return { tipo: 'vacio' };
  }
  if (typeof plano === 'number') {
    return Number.isInteger(plano) ? { tipo: 'numero', valor: plano } : { tipo: 'invalido', texto: String(plano) };
  }

  const limpio = plano
    .replace(/[$\s]/g, '') // Quita el signo $ y los espacios
    .replace(/\.(?=\d{3}(?!\d))/g, ''); // Quita los puntos de miles ("10.000" → "10000")

  return /^\d+$/.test(limpio) ? { tipo: 'numero', valor: Number(limpio) } : { tipo: 'invalido', texto: plano };
}
