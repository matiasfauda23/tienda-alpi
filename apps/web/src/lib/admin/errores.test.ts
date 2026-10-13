import { describe, expect, it } from 'vitest';
import { ErrorDeApiAdmin } from './cliente-admin';
import { describirError } from './errores';

describe('describirError', () => {
  it('muestra los mensajes de validación de la API tal cual', () => {
    expect(describirError(new ErrorDeApiAdmin(400, 'El SKU ya existe.'))).toBe('El SKU ya existe.');
  });

  it('traduce los errores que NestJS genera en inglés', () => {
    expect(describirError(new ErrorDeApiAdmin(413, 'File too large'))).toContain('máximo 2 MB');
    expect(describirError(new ErrorDeApiAdmin(429, 'ThrottlerException'))).toContain('Demasiados pedidos');
    expect(describirError(new ErrorDeApiAdmin(500, 'Internal server error'))).toContain('error en el servidor');
  });

  it('tiene un mensaje para errores de red', () => {
    expect(describirError(new TypeError('Failed to fetch'))).toContain('No se pudo conectar');
  });
});
