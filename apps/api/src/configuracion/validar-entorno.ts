/** Variables de entorno obligatorias para que la API arranque. */
const VARIABLES_REQUERIDAS = ['DATABASE_URL', 'JWT_SECRETO_ACCESO', 'JWT_SECRETO_REFRESH'] as const;

/** Secretos de los tokens: tienen que ser largos para que no se puedan adivinar. */
const SECRETOS = ['JWT_SECRETO_ACCESO', 'JWT_SECRETO_REFRESH'] as const;
const LARGO_MINIMO_SECRETO = 32;

/** Verifica las variables obligatorias y la fortaleza de los secretos; si algo falla, la app no arranca. */
export function validarEntorno(entorno: Record<string, unknown>): Record<string, unknown> {
  const faltantes = VARIABLES_REQUERIDAS.filter((nombre) => !entorno[nombre]);
  if (faltantes.length > 0) {
    throw new Error(`Faltan variables de entorno: ${faltantes.join(', ')}`);
  }

  for (const nombre of SECRETOS) {
    if (String(entorno[nombre]).length < LARGO_MINIMO_SECRETO) {
      throw new Error(`${nombre} debe tener al menos ${LARGO_MINIMO_SECRETO} caracteres.`);
    }
  }

  if (entorno.JWT_SECRETO_ACCESO === entorno.JWT_SECRETO_REFRESH) {
    throw new Error('JWT_SECRETO_ACCESO y JWT_SECRETO_REFRESH deben ser distintos.');
  }

  return entorno;
}
