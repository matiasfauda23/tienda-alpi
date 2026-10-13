import { describe, expect, it } from 'vitest';
import {
  convertirContacto,
  moverElemento,
  validarBanner,
  validarContacto,
  validarPregunta,
} from './contenido-admin';

const CONTACTO = { whatsapp: '+54 9 11 7825-4471', email: ' Tienda@Gmail.com ', instagram: '@tienda_alpi', tiktok: '' };

describe('contacto', () => {
  it('acepta el WhatsApp con espacios y signos, y los opcionales vacíos', () => {
    expect(validarContacto(CONTACTO)).toEqual({});
  });

  it('marca WhatsApp corto, email y usuarios inválidos', () => {
    const errores = validarContacto({ whatsapp: '1234', email: 'no-es-email', instagram: 'con espacio', tiktok: 'a' });
    expect(Object.keys(errores).sort()).toEqual(['email', 'instagram', 'tiktok', 'whatsapp']);
  });

  it('limpia los datos y no envía los opcionales vacíos', () => {
    expect(convertirContacto(CONTACTO)).toEqual({
      whatsapp: '5491178254471',
      email: 'tienda@gmail.com',
      instagram: 'tienda_alpi',
    });
  });
});

describe('banner y preguntas', () => {
  it('exige título en el banner', () => {
    expect(validarBanner({ visible: true, titulo: '  ', subtitulo: '' }).titulo).toBeDefined();
    expect(validarBanner({ visible: false, titulo: 'Hola', subtitulo: '' })).toEqual({});
  });

  it('valida largo de pregunta y respuesta', () => {
    expect(validarPregunta({ pregunta: '¿Qué?', respuesta: 'Sí' })).toEqual({});
    expect(Object.keys(validarPregunta({ pregunta: 'Hola', respuesta: ' ' })).sort()).toEqual(['pregunta', 'respuesta']);
  });
});

describe('moverElemento', () => {
  it('mueve hacia arriba y hacia abajo', () => {
    expect(moverElemento(['a', 'b', 'c'], 2, 1)).toEqual(['a', 'c', 'b']);
    expect(moverElemento(['a', 'b', 'c'], 0, 1)).toEqual(['b', 'a', 'c']);
  });

  it('no hace nada si la posición no existe', () => {
    expect(moverElemento(['a', 'b'], 0, -1)).toEqual(['a', 'b']);
    expect(moverElemento(['a', 'b'], 1, 2)).toEqual(['a', 'b']);
  });
});
