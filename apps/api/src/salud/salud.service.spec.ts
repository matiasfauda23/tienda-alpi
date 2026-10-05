import { Test } from '@nestjs/testing';
import { PrismaService } from '../base-de-datos/prisma.service';
import { SaludService } from './salud.service';

/** Crea el servicio con un PrismaService simulado que responde bien o falla, según se indique. */
async function crearServicio(baseFalla: boolean): Promise<SaludService> {
  const prismaSimulado = {
    $queryRaw: jest.fn(() =>
      baseFalla ? Promise.reject(new Error('sin conexión')) : Promise.resolve([{ resultado: 1 }]),
    ),
  };

  const modulo = await Test.createTestingModule({
    providers: [SaludService, { provide: PrismaService, useValue: prismaSimulado }],
  }).compile();

  return modulo.get(SaludService);
}

describe('SaludService', () => {
  it('informa ok cuando la base de datos responde', async () => {
    const servicio = await crearServicio(false);
    const estado = await servicio.obtenerEstado();

    expect(estado.estado).toBe('ok');
    expect(estado.baseDeDatos).toBe('ok');
  });

  it('informa error cuando la base de datos no responde', async () => {
    const servicio = await crearServicio(true);
    const estado = await servicio.obtenerEstado();

    expect(estado.estado).toBe('error');
    expect(estado.baseDeDatos).toBe('error');
  });
});
