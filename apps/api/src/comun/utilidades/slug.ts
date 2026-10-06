/** Convierte un texto en un slug apto para URLs: "Mates Térmicos" → "mates-termicos". */
export function generarSlug(texto: string): string {
  return texto
    .normalize('NFD') // Separa las letras de sus tildes: "é" → "e" + "´"
    .replace(/[\u0300-\u036f]/g, '') // Borra las tildes sueltas
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-') // Reemplaza todo lo que no sea letra o número por "-"
    .replace(/^-+|-+$/g, ''); // Quita guiones al principio y al final
}
