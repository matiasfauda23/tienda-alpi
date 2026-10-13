import { describe, expect, it } from 'vitest';
import type { Categoria } from '../api/tipos';
import {
  armarCambiosCategoria,
  calcularSiguienteOrden,
  crearBorradorCategoria,
  ordenarCategorias,
  validarBorradorCategoria,
} from './categorias-admin';

const MATES: Categoria = { id: '1', nombre: 'Mates', slug: 'mates', orden: 1, activa: true };
const TERMOS: Categoria = { id: '2', nombre: 'Termos', slug: 'termos', orden: 0, activa: true };
const BOMBILLAS: Categoria = { id: '3', nombre: 'Bombillas', slug: 'bombillas', orden: 1, activa: false };

describe('ordenarCategorias y calcularSiguienteOrden', () => {
  it('ordena por orden y desempata por nombre', () => {
    expect(ordenarCategorias([MATES, TERMOS, BOMBILLAS]).map((c) => c.nombre)).toEqual([
      'Termos',
      'Bombillas',
      'Mates',
    ]);
  });

  it('propone el orden siguiente al mayor', () => {
    expect(calcularSiguienteOrden([MATES, TERMOS])).toBe(2);
    expect(calcularSiguienteOrden([])).toBe(0);
  });
});

describe('validarBorradorCategoria', () => {
  it('acepta un borrador válido', () => {
    expect(validarBorradorCategoria(crearBorradorCategoria(MATES))).toBeNull();
  });

  it('rechaza nombres muy cortos y órdenes inválidos', () => {
    expect(validarBorradorCategoria({ nombre: ' a ', orden: '1', activa: true })).toContain('nombre');
    expect(validarBorradorCategoria({ nombre: 'Mates', orden: '', activa: true })).toContain('orden');
    expect(validarBorradorCategoria({ nombre: 'Mates', orden: '1.5', activa: true })).toContain('orden');
    expect(validarBorradorCategoria({ nombre: 'Mates', orden: '1001', activa: true })).toContain('orden');
  });
});

describe('armarCambiosCategoria', () => {
  it('devuelve solo lo que cambió', () => {
    expect(armarCambiosCategoria(MATES, { nombre: ' Mates ', orden: '1', activa: true })).toEqual({});
    expect(armarCambiosCategoria(MATES, { nombre: 'Mates térmicos', orden: '3', activa: false })).toEqual({
      nombre: 'Mates térmicos',
      orden: 3,
      activa: false,
    });
  });
});
