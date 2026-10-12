import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorDeApiAdmin, ErrorDeSesion, extraerMensajeDeError, pedirAdmin } from './cliente-admin';

const URL_API = 'http://api.prueba/api';

/** Arma una respuesta JSON simulada. */
function responder(estado: number, cuerpo?: unknown): Response {
  return new Response(cuerpo === undefined ? null : JSON.stringify(cuerpo), { status: estado });
}

/** Devuelve las rutas que se pidieron al fetch simulado. */
function rutasPedidas(simulado: ReturnType<typeof vi.fn>): string[] {
  return simulado.mock.calls.map(([url]) => String(url).replace(URL_API, ''));
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_API_URL', URL_API);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('pedirAdmin', () => {
  it('devuelve el JSON y manda las cookies', async () => {
    const simulado = vi.fn().mockResolvedValue(responder(200, { ok: true }));
    vi.stubGlobal('fetch', simulado);

    await expect(pedirAdmin('/admin/productos')).resolves.toEqual({ ok: true });
    expect(simulado.mock.calls[0][1]).toMatchObject({ credentials: 'include' });
  });

  it('si el acceso venció, refresca y reintenta', async () => {
    const simulado = vi
      .fn()
      .mockResolvedValueOnce(responder(401))
      .mockResolvedValueOnce(responder(200))
      .mockResolvedValueOnce(responder(200, { datos: 1 }));
    vi.stubGlobal('fetch', simulado);

    await expect(pedirAdmin('/admin/productos')).resolves.toEqual({ datos: 1 });
    expect(rutasPedidas(simulado)).toEqual(['/admin/productos', '/auth/refrescar', '/admin/productos']);
  });

  it('si el refresh falla, lanza ErrorDeSesion', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(responder(401)));
    await expect(pedirAdmin('/admin/productos')).rejects.toBeInstanceOf(ErrorDeSesion);
  });

  it('un login fallido es un error común, sin intentar refrescar', async () => {
    const simulado = vi.fn().mockResolvedValue(responder(401, { message: 'Credenciales inválidas' }));
    vi.stubGlobal('fetch', simulado);

    const promesa = pedirAdmin('/auth/login', { metodo: 'POST', cuerpo: {} });
    await expect(promesa).rejects.toBeInstanceOf(ErrorDeApiAdmin);
    await expect(promesa).rejects.toMatchObject({ estado: 401, message: 'Credenciales inválidas' });
    expect(rutasPedidas(simulado)).toEqual(['/auth/login']);
  });

  it('varios pedidos vencidos a la vez comparten un solo refresh', async () => {
    let sesionRenovada = false;
    const simulado = vi.fn(async (url: string) => {
      if (url.endsWith('/auth/refrescar')) {
        await new Promise((resolver) => setTimeout(resolver, 10));
        sesionRenovada = true;
        return responder(200);
      }
      return sesionRenovada ? responder(200, []) : responder(401);
    });
    vi.stubGlobal('fetch', simulado);

    await Promise.all([pedirAdmin('/admin/productos'), pedirAdmin('/admin/escalas')]);
    expect(rutasPedidas(simulado).filter((ruta) => ruta === '/auth/refrescar')).toHaveLength(1);
  });
});

describe('extraerMensajeDeError', () => {
  it('une los mensajes de validación y tiene un mensaje por defecto', () => {
    expect(extraerMensajeDeError({ message: ['nombre vacío', 'precio inválido'] }, 400)).toBe(
      'nombre vacío. precio inválido',
    );
    expect(extraerMensajeDeError(null, 500)).toBe('Error 500 al comunicarse con el servidor.');
  });
});
