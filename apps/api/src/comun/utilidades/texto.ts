/** Pasa un texto a minúsculas, sin tildes y con espacios simples: "  Mate  Térmico " → "mate termico". */
export function normalizarTexto(texto: string): string {
  return texto
    .normalize('NFD') // Separa las letras de sus tildes: "é" → "e" + "´"
    .replace(/[\u0300-\u036f]/g, '') // Borra las tildes sueltas
    .toLowerCase()
    .replace(/\s+/g, ' ') // Varios espacios seguidos pasan a ser uno
    .trim();
}
