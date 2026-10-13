import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { descargarAdmin, ErrorDeApiAdmin } from './cliente-admin';

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://api.prueba/api');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('descargarAdmin', () => {
  it('devuelve el archivo como Blob', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('contenido-binario', { status: 200 })));
    const archivo = await descargarAdmin('/admin/planillas/exportar');
    expect(await archivo.text()).toBe('contenido-binario');
  });

  it('si la API responde con error, lanza su mensaje', async () => {
    const error = new Response(JSON.stringify({ message: 'No hay variantes.' }), { status: 404 });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(error));
    await expect(descargarAdmin('/admin/planillas/exportar')).rejects.toMatchObject({
      estado: 404,
      message: 'No hay variantes.',
    });
    expect(ErrorDeApiAdmin).toBeDefined();
  });
});
