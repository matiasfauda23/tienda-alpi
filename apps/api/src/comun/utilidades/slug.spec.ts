import { generarSlug } from './slug';

describe('generarSlug', () => {
  it.each([
    ['Mates Térmicos', 'mates-termicos'],
    ['  Bombillas  ', 'bombillas'],
    ['Termos 1L / Acero', 'termos-1l-acero'],
    ['Ñandú & Cía.', 'nandu-cia'],
  ])('convierte "%s" en "%s"', (texto, esperado) => {
    expect(generarSlug(texto)).toBe(esperado);
  });

  it('devuelve vacío si el texto no tiene letras ni números', () => {
    expect(generarSlug('¡¡¡!!!')).toBe('');
  });
});
