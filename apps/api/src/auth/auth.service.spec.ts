import { UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { hashearContrasena } from '../comun/seguridad/contrasenas';
import { hashearToken } from '../comun/seguridad/hash';
import { AdministradoresRepository } from './administradores.repository';
import { AuthService } from './auth.service';
import { TokensService } from './tokens.service';

const ID_ADMIN = '77777777-7777-4777-8777-777777777777';
const EMAIL = 'marce@tiendaalpi.com.ar';
const CONTRASENA = 'una-contrasena-segura';

describe('AuthService', () => {
  let servicio: AuthService;
  let hashContrasena: string;
  let repositorio: {
    buscarPorEmail: jest.Mock;
    buscarPorId: jest.Mock;
    registrarIngreso: jest.Mock;
    guardarHashRefresh: jest.Mock;
  };
  let tokens: { generarPar: jest.Mock; verificarRefresh: jest.Mock };

  // Hashea la contraseña de prueba una sola vez (Argon2 es lento a propósito)
  beforeAll(async () => {
    hashContrasena = await hashearContrasena(CONTRASENA);
  });

  beforeEach(async () => {
    repositorio = {
      buscarPorEmail: jest.fn(),
      buscarPorId: jest.fn(),
      registrarIngreso: jest.fn(),
      guardarHashRefresh: jest.fn(),
    };
    tokens = {
      generarPar: jest.fn().mockResolvedValue({ acceso: 'acceso-nuevo', refresh: 'refresh-nuevo' }),
      verificarRefresh: jest.fn().mockResolvedValue({ id: ID_ADMIN, email: EMAIL }),
    };

    const modulo = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: AdministradoresRepository, useValue: repositorio },
        { provide: TokensService, useValue: tokens },
      ],
    }).compile();

    servicio = modulo.get(AuthService);
  });

  describe('iniciarSesion', () => {
    it('con la contraseña correcta abre sesión y guarda solo el hash del refresh', async () => {
      repositorio.buscarPorEmail.mockResolvedValue({ id: ID_ADMIN, email: EMAIL, hashContrasena });

      const resultado = await servicio.iniciarSesion(EMAIL, CONTRASENA);

      expect(resultado.administrador).toEqual({ id: ID_ADMIN, email: EMAIL });
      expect(repositorio.registrarIngreso).toHaveBeenCalledWith(ID_ADMIN, hashearToken('refresh-nuevo'));
    });

    it('con la contraseña incorrecta responde 401 con el mensaje genérico', async () => {
      repositorio.buscarPorEmail.mockResolvedValue({ id: ID_ADMIN, email: EMAIL, hashContrasena });

      await expect(servicio.iniciarSesion(EMAIL, 'otra-contrasena')).rejects.toThrow(
        'Email o contraseña incorrectos.',
      );
    });

    it('con un email que no existe responde exactamente el mismo mensaje', async () => {
      repositorio.buscarPorEmail.mockResolvedValue(null);

      await expect(servicio.iniciarSesion('nadie@ejemplo.com', CONTRASENA)).rejects.toThrow(
        'Email o contraseña incorrectos.',
      );
    });
  });

  describe('refrescarSesion', () => {
    it('cambia un refresh vigente por uno nuevo (rotación)', async () => {
      repositorio.buscarPorId.mockResolvedValue({
        id: ID_ADMIN,
        email: EMAIL,
        hashRefreshToken: hashearToken('refresh-vigente'),
      });

      await servicio.refrescarSesion('refresh-vigente');

      expect(repositorio.guardarHashRefresh).toHaveBeenCalledWith(ID_ADMIN, hashearToken('refresh-nuevo'));
    });

    it('si se reutiliza un refresh viejo, invalida toda la sesión', async () => {
      repositorio.buscarPorId.mockResolvedValue({
        id: ID_ADMIN,
        email: EMAIL,
        hashRefreshToken: hashearToken('refresh-vigente'),
      });

      await expect(servicio.refrescarSesion('refresh-viejo')).rejects.toThrow(UnauthorizedException);
      expect(repositorio.guardarHashRefresh).toHaveBeenCalledWith(ID_ADMIN, null);
    });

    it('sin cookie de refresh responde 401', async () => {
      await expect(servicio.refrescarSesion(undefined)).rejects.toThrow(UnauthorizedException);
    });
  });
});
