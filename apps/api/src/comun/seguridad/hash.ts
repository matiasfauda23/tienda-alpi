import { createHash, timingSafeEqual } from 'node:crypto';

/**
 * Calcula el hash SHA-256 de un token para guardarlo en la base sin exponer el token real.
 * Alcanza con SHA-256 (rápido) porque los tokens son aleatorios y largos, no como una contraseña.
 */
export function hashearToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** Compara dos textos en tiempo constante, para que el tiempo de respuesta no revele cuántos caracteres coinciden. */
export function sonIguales(textoA: string, textoB: string): boolean {
  const bufferA = Buffer.from(textoA);
  const bufferB = Buffer.from(textoB);
  return bufferA.length === bufferB.length && timingSafeEqual(bufferA, bufferB);
}
