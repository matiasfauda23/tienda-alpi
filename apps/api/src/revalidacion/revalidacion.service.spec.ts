import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RevalidacionService } from './revalidacion.service';

const SECRETO = 'x'.repeat(64);

/** Crea el servicio con la configuración indicada. */
function crearServicio(valores: Record<string, string>): RevalidacionService {
  const configuracion = { get: (clave: string) => valores[clave] } as unknown as ConfigService;
  return new RevalidacionService(configuracion);
}

describe('RevalidacionService', () => {
  const fetchOriginal = global.fetch;
  let fetchSimulado: jest.Mock;
  let avisoSimulado: jest.SpyInstance;

  beforeEach(() => {
    fetchSimulado = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchSimulado as unknown as typeof fetch;
    avisoSimulado = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    global.fetch = fetchOriginal;
    avisoSimulado.mockRestore();
  });

  it('avisa a la web con el secreto y las etiquetas', async () => {
    const servicio = crearServicio({ REVALIDACION_SECRETO: SECRETO, URL_FRONTEND: 'http://web.prueba/' });
    await servicio.avisar(['productos']);

    expect(fetchSimulado).toHaveBeenCalledWith(
      'http://web.prueba/api/revalidar',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: `Bearer ${SECRETO}` }),
        body: JSON.stringify({ etiquetas: ['productos'] }),
      }),
    );
  });

  it('no hace nada si falta el secreto o es corto', async () => {
    await crearServicio({ URL_FRONTEND: 'http://web.prueba' }).avisar(['productos']);
    await crearServicio({ REVALIDACION_SECRETO: 'corto', URL_FRONTEND: 'http://web.prueba' }).avisar(['productos']);
    expect(fetchSimulado).not.toHaveBeenCalled();
  });

  it('no lanza errores si la web no responde', async () => {
    fetchSimulado.mockRejectedValue(new Error('ECONNREFUSED'));
    const servicio = crearServicio({ REVALIDACION_SECRETO: SECRETO, URL_FRONTEND: 'http://web.prueba' });
    await expect(servicio.avisar(['contenido'])).resolves.toBeUndefined();
    expect(avisoSimulado).toHaveBeenCalledWith(expect.stringContaining('ECONNREFUSED'));
  });
});
