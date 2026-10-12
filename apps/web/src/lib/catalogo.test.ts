import { describe, expect, it } from 'vitest';
import {
  alternarCategoria,
  armarConsultaApi,
  armarUrlCatalogo,
  hayFiltrosActivos,
  leerFiltrosCatalogo,
} from './catalogo';

describe('leerFiltrosCatalogo', () => {
  it('devuelve valores por defecto si la URL no trae nada', () => {
    expect(leerFiltrosCatalogo({})).toEqual({
      categorias: [],
      buscar: '',
      precioMin: undefined,
      precioMax: undefined,
      orden: 'recientes',
      pagina: 1,
    });
  });

  it('acepta categorías separadas por coma o repetidas, sin duplicados', () => {
    expect(leerFiltrosCatalogo({ categoria: 'mates,termos' }).categorias).toEqual(['mates', 'termos']);
    expect(leerFiltrosCatalogo({ categoria: ['mates', 'mates', 'vasos'] }).categorias).toEqual([
      'mates',
      'vasos',
    ]);
  });

  it('descarta slugs con caracteres no permitidos', () => {
    expect(leerFiltrosCatalogo({ categoria: 'mates,<script>,../x' }).categorias).toEqual(['mates']);
  });

  it('ignora páginas, precios y órdenes inválidos', () => {
    const filtros = leerFiltrosCatalogo({
      pagina: '-3',
      precioMin: 'abc',
      precioMax: '',
      orden: 'DROP TABLE',
    });
    expect(filtros.pagina).toBe(1);
    expect(filtros.precioMin).toBeUndefined();
    expect(filtros.precioMax).toBeUndefined();
    expect(filtros.orden).toBe('recientes');
  });

  it('invierte el rango si el mínimo es mayor que el máximo', () => {
    const filtros = leerFiltrosCatalogo({ precioMin: '9000', precioMax: '3000' });
    expect([filtros.precioMin, filtros.precioMax]).toEqual([3000, 9000]);
  });

  it('recorta la búsqueda a 100 caracteres', () => {
    expect(leerFiltrosCatalogo({ buscar: 'a'.repeat(300) }).buscar).toHaveLength(100);
  });
});

describe('armarConsultaApi', () => {
  it('incluye los filtros activos y el tamaño de página', () => {
    const filtros = leerFiltrosCatalogo({ categoria: 'mates', orden: 'precio-asc', pagina: '2' });
    expect(armarConsultaApi(filtros)).toBe(
      '/productos?categoria=mates&orden=precio-asc&pagina=2&porPagina=12',
    );
  });
});

describe('armarUrlCatalogo', () => {
  it('devuelve /productos sin parámetros si no hay filtros', () => {
    expect(armarUrlCatalogo(leerFiltrosCatalogo({}))).toBe('/productos');
  });

  it('vuelve a la página 1 al cambiar un filtro', () => {
    const filtros = leerFiltrosCatalogo({ pagina: '4' });
    expect(armarUrlCatalogo(filtros, { orden: 'nombre' })).toBe('/productos?orden=nombre');
  });

  it('respeta la página si se pide explícitamente', () => {
    const filtros = leerFiltrosCatalogo({ buscar: 'mate' });
    expect(armarUrlCatalogo(filtros, { pagina: 3 })).toBe('/productos?buscar=mate&pagina=3');
  });
});

describe('alternarCategoria y hayFiltrosActivos', () => {
  it('agrega y quita categorías', () => {
    expect(alternarCategoria(['mates'], 'termos')).toEqual(['mates', 'termos']);
    expect(alternarCategoria(['mates', 'termos'], 'mates')).toEqual(['termos']);
  });

  it('detecta filtros activos, sin contar el orden ni la página', () => {
    expect(hayFiltrosActivos(leerFiltrosCatalogo({ orden: 'nombre', pagina: '2' }))).toBe(false);
    expect(hayFiltrosActivos(leerFiltrosCatalogo({ precioMax: '5000' }))).toBe(true);
  });
});
