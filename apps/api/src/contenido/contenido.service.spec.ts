import { Test } from '@nestjs/testing';
import { ContenidoRepository } from './contenido.repository';
import { CONTENIDO_POR_DEFECTO } from './contenido.tipos';
import { ContenidoService } from './contenido.service';

describe('ContenidoService', () => {
  let servicio: ContenidoService;
  let repositorio: { listar: jest.Mock; guardar: jest.Mock };

  beforeEach(async () => {
    repositorio = { listar: jest.fn().mockResolvedValue([]), guardar: jest.fn() };

    const modulo = await Test.createTestingModule({
      providers: [ContenidoService, { provide: ContenidoRepository, useValue: repositorio }],
    }).compile();

    servicio = modulo.get(ContenidoService);
  });

  describe('obtenerTodo', () => {
    it('sin nada cargado devuelve los valores por defecto', async () => {
      await expect(servicio.obtenerTodo()).resolves.toEqual(CONTENIDO_POR_DEFECTO);
    });

    it('completa con valores por defecto los campos que una sección vieja no tiene', async () => {
      // Simula un contacto guardado antes de que existiera el campo "tiktok"
      repositorio.listar.mockResolvedValue([
        { clave: 'contacto', valor: { whatsapp: '5491178254471', email: 'a@b.com', instagram: 'tienda_alpi' } },
      ]);

      const contenido = await servicio.obtenerTodo();

      expect(contenido.contacto).toEqual({
        whatsapp: '5491178254471',
        email: 'a@b.com',
        instagram: 'tienda_alpi',
        tiktok: '',
      });
    });

    it('ignora un valor guardado que no es un objeto', async () => {
      repositorio.listar.mockResolvedValue([{ clave: 'banner', valor: 'texto roto' }]);

      const contenido = await servicio.obtenerTodo();

      expect(contenido.banner).toEqual(CONTENIDO_POR_DEFECTO.banner);
    });
  });

  describe('guardar', () => {
    it('guarda el contacto completando los campos opcionales vacíos', async () => {
      await servicio.guardarContacto({ whatsapp: '5491178254471' });

      expect(repositorio.guardar).toHaveBeenCalledWith('contacto', {
        whatsapp: '5491178254471',
        email: '',
        instagram: '',
        tiktok: '',
      });
    });

    it('guarda las preguntas frecuentes como objetos simples', async () => {
      await servicio.guardarFaq({
        preguntas: [{ pregunta: '¿Hacen envíos?', respuesta: 'Sí, a todo el país.' }],
      });

      expect(repositorio.guardar).toHaveBeenCalledWith('faq', {
        preguntas: [{ pregunta: '¿Hacen envíos?', respuesta: 'Sí, a todo el país.' }],
      });
    });
  });
});
