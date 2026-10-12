import { describe, expect, it } from 'vitest';
import { armarFaqEstructurada, esEnlaceExterno, serializarJsonLd } from './contenido';

describe('esEnlaceExterno', () => {
  it('detecta links a otros sitios', () => {
    expect(esEnlaceExterno('https://instagram.com/tienda_alpi')).toBe(true);
    expect(esEnlaceExterno('HTTP://ejemplo.com')).toBe(true);
  });

  it('no considera externos los links internos, vacíos o de otro protocolo', () => {
    expect(esEnlaceExterno('/productos')).toBe(false);
    expect(esEnlaceExterno('#precios')).toBe(false);
    expect(esEnlaceExterno(undefined)).toBe(false);
    expect(esEnlaceExterno('javascript:alert(1)')).toBe(false);
  });
});

describe('armarFaqEstructurada', () => {
  it('arma una FAQPage con cada pregunta y respuesta', () => {
    const datos = armarFaqEstructurada([{ pregunta: '¿Hacen envíos?', respuesta: 'Sí, a todo el país.' }]);
    expect(datos['@type']).toBe('FAQPage');
    expect(datos.mainEntity).toEqual([
      {
        '@type': 'Question',
        name: '¿Hacen envíos?',
        acceptedAnswer: { '@type': 'Answer', text: 'Sí, a todo el país.' },
      },
    ]);
  });
});

describe('serializarJsonLd', () => {
  it('no deja ningún "<" que pueda cerrar el script', () => {
    const json = serializarJsonLd({ texto: '</script><script>alert(1)</script>' });
    expect(json).not.toContain('<');
    expect(JSON.parse(json)).toEqual({ texto: '</script><script>alert(1)</script>' });
  });
});
