import { PeticionAutenticada } from '../auth/auth.tipos';
import { armarRegistro, obtenerEntidad, ocultarDatosSensibles } from './armar-registro';

/** Crea una petición de prueba con valores por defecto que se pueden pisar. */
function crearPeticion(datos: Record<string, unknown>): PeticionAutenticada {
  return {
    method: 'PATCH',
    path: '/api/admin/productos/abc',
    route: { path: '/api/admin/productos/:id' },
    params: {},
    body: {},
    ip: '127.0.0.1',
    administrador: { id: 'admin-1', email: 'marce@tiendaalpi.com.ar' },
    ...datos,
  } as unknown as PeticionAutenticada;
}

describe('ocultarDatosSensibles', () => {
  it('oculta contraseñas y tokens, también si están anidados', () => {
    const resultado = ocultarDatosSensibles({
      nombre: 'Mates',
      contrasena: '123',
      sesion: { refreshToken: 'abc' },
    });

    expect(resultado).toEqual({ nombre: 'Mates', contrasena: '[oculto]', sesion: { refreshToken: '[oculto]' } });
  });
});

describe('obtenerEntidad', () => {
  it.each([
    ['/api/admin/productos/:id/variantes/:varianteId', 'productos'],
    ['/api/admin/contenido/faq', 'contenido'],
    ['/api/admin/escalas', 'escalas'],
  ])('en "%s" la entidad es "%s"', (ruta, esperada) => {
    expect(obtenerEntidad(ruta)).toBe(esperada);
  });
});

describe('armarRegistro', () => {
  it('registra quién, qué y sobre cuál variante', () => {
    const registro = armarRegistro(
      crearPeticion({
        route: { path: '/api/admin/productos/:id/variantes/:varianteId' },
        params: { id: 'producto-1', varianteId: 'variante-1' },
        body: { stock: 50 },
      }),
      {},
    );

    expect(registro).toEqual({
      administradorId: 'admin-1',
      accion: 'PATCH',
      entidad: 'productos',
      entidadId: 'variante-1',
      ruta: '/api/admin/productos/:id/variantes/:varianteId',
      datos: { stock: 50 },
      ip: '127.0.0.1',
    });
  });

  it('al crear algo, toma el id de la respuesta', () => {
    const registro = armarRegistro(
      crearPeticion({ method: 'POST', route: { path: '/api/admin/categorias' }, body: { nombre: 'Yerbas' } }),
      { id: 'categoria-nueva' },
    );

    expect(registro.entidadId).toBe('categoria-nueva');
    expect(registro.entidad).toBe('categorias');
  });
});
