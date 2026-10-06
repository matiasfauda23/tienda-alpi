import * as argon2 from 'argon2';

/** Parámetros de Argon2id recomendados por OWASP: 19 MiB de memoria y 2 iteraciones. */
const OPCIONES_ARGON2 = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
} as const;

/** Convierte una contraseña en un hash seguro para guardar en la base. */
export function hashearContrasena(contrasena: string): Promise<string> {
  return argon2.hash(contrasena, OPCIONES_ARGON2);
}

/**
 * Verifica una contraseña contra su hash.
 * Si no hay hash (el email no existe), igual hace el trabajo de hashear: así la respuesta
 * tarda lo mismo y nadie puede descubrir qué emails existen midiendo el tiempo.
 */
export async function verificarContrasena(hash: string | null, contrasena: string): Promise<boolean> {
  if (!hash) {
    await argon2.hash(contrasena, OPCIONES_ARGON2);
    return false;
  }

  try {
    return await argon2.verify(hash, contrasena);
  } catch {
    return false;
  }
}
