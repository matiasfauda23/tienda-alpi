import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ErrorDeValidacionDePrecios } from '@tienda-alpi/precios';
import { EscalasRepository } from './escalas.repository';
import { EscalasService } from './escalas.service';

const ID_ESCALA = '44444444-4444-4444-8444-444444444444';

const ESCALAS_VALIDAS = [
  { nombre: 'Minorista', cantidadMinima: 1, porcentajeDescuento: 0 },
  { nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 10 },
  { nombre: 'Distribuidor', cantidadMinima: 500, porcentajeDescuento: 20 },
];

describe('EscalasService', () => {
  let servicio: EscalasService;
  let repositorio: { listar: jest.Mock; reemplazarTodas: jest.Mock };

  beforeEach(async () => {
    repositorio = { listar: jest.fn().mockResolvedValue([]), reemplazarTodas: jest.fn() };

    const modulo = await Test.createTestingModule({
      providers: [EscalasService, { provide: EscalasRepository, useValue: repositorio }],
    }).compile();

    servicio = modulo.get(EscalasService);
  });

  describe('reemplazar', () => {
    it('guarda una lista de escalas válida', async () => {
      await servicio.reemplazar({ escalas: ESCALAS_VALIDAS });

      expect(repositorio.reemplazarTodas).toHaveBeenCalledWith(ESCALAS_VALIDAS);
    });

    it('rechaza una lista que no empieza en 1 unidad (regla del paquete de precios)', async () => {
      const invalidas = [{ nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 10 }];

      await expect(servicio.reemplazar({ escalas: invalidas })).rejects.toThrow(
        ErrorDeValidacionDePrecios,
      );
      expect(repositorio.reemplazarTodas).not.toHaveBeenCalled();
    });

    it('rechaza una escala con un id que no existe', async () => {
      const conIdDesconocido = [{ ...ESCALAS_VALIDAS[0], id: ID_ESCALA }];

      await expect(servicio.reemplazar({ escalas: conIdDesconocido })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('obtenerParaCalculo', () => {
    it('responde 503 si no hay escalas configuradas', async () => {
      await expect(servicio.obtenerParaCalculo()).rejects.toThrow(ServiceUnavailableException);
    });
  });
});
