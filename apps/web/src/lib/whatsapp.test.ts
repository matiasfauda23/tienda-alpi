import { describe, expect, it } from 'vitest';
import { crearEnlaceWhatsApp } from './whatsapp';

describe('crearEnlaceWhatsApp', () => {
  it('arma el link solo con los dígitos del número', () => {
    expect(crearEnlaceWhatsApp('+54 9 11 7825-4471')).toBe('https://wa.me/5491178254471');
  });

  it('agrega el mensaje codificado para la URL', () => {
    expect(crearEnlaceWhatsApp('5491178254471', 'Hola! ¿Tienen termos?')).toBe(
      'https://wa.me/5491178254471?text=Hola!%20%C2%BFTienen%20termos%3F',
    );
  });
});
