import { describe, expect, it } from 'vitest';
import { ErrorDeApiAdmin } from './cliente-admin';
import { describirErrorDeIngreso, elegirDestinoSeguro, esEnlaceActivo } from './utilidades';

describe('elegirDestinoSeguro', () => {
  it('acepta rutas internas del panel', () => {
    expect(elegirDestinoSeguro('/admin/productos')).toBe('/admin/productos');
    expect(elegirDestinoSeguro('/admin')).toBe('/admin');
  });

  it('rechaza otros sitios, rutas raras y el propio login', () => {
    for (const volver of [
      'https://sitio-falso.com',
      '//sitio-falso.com',
      '/admin/../productos',
      '/productos',
      '/admin/ingresar',
      'javascript:alert(1)',
      null,
    ]) {
      expect(elegirDestinoSeguro(volver)).toBe('/admin');
    }
  });
});

describe('esEnlaceActivo', () => {
  it('marca el inicio solo en /admin exacto', () => {
    expect(esEnlaceActivo('/admin', '/admin')).toBe(true);
    expect(esEnlaceActivo('/admin', '/admin/productos')).toBe(false);
  });

  it('marca una sección también en sus subpáginas, sin confundir prefijos', () => {
    expect(esEnlaceActivo('/admin/productos', '/admin/productos/abc')).toBe(true);
    expect(esEnlaceActivo('/admin/productos', '/admin/productos-viejos')).toBe(false);
  });
});

describe('describirErrorDeIngreso', () => {
  it('traduce los errores de la API', () => {
    expect(describirErrorDeIngreso(new ErrorDeApiAdmin(401, 'x'))).toBe('Email o contraseña incorrectos.');
    expect(describirErrorDeIngreso(new ErrorDeApiAdmin(429, 'x'))).toContain('Demasiados intentos');
    expect(describirErrorDeIngreso(new Error('red caída'))).toContain('No se pudo conectar');
  });
});
