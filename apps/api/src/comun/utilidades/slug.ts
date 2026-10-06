import { normalizarTexto } from './texto';

/** Convierte un texto en un slug apto para URLs: "Mates Térmicos" → "mates-termicos". */
export function generarSlug(texto: string): string {
  return normalizarTexto(texto)
    .replace(/[^a-z0-9]+/g, '-') // Reemplaza todo lo que no sea letra o número por "-"
    .replace(/^-+|-+$/g, ''); // Quita guiones al principio y al final
}
