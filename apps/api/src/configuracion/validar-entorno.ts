/** Variables de entorno obligatorias para que la API arranque. */
const VARIABLES_REQUERIDAS = ['DATABASE_URL'] as const;

/** Verifica que estén todas las variables obligatorias; si falta alguna, la app no arranca. */
export function validarEntorno(entorno: Record<string, unknown>): Record<string, unknown> {
  const faltantes = VARIABLES_REQUERIDAS.filter((nombre) => !entorno[nombre]);

  if (faltantes.length > 0) {
    throw new Error(`Faltan variables de entorno: ${faltantes.join(', ')}`);
  }

  return entorno;
}
