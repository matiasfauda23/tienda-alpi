import 'server-only';

/** URL de la API sin la barra final. Solo existe en el servidor: nunca llega al navegador. */
export function obtenerUrlApi(): string {
  const url = process.env.API_URL;

  if (!url) {
    throw new Error('Falta la variable de entorno API_URL (ver apps/web/.env.example).');
  }
  return url.replace(/\/$/, '');
}
