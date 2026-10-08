/** Formateador de pesos argentinos sin centavos (se crea una sola vez y se reutiliza). */
const formateadorPesos = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

/** Muestra un precio en pesos: 10000 → "$ 10.000". */
export function formatearPrecio(pesos: number): string {
  return formateadorPesos.format(pesos);
}
