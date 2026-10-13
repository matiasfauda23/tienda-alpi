import type { APIRequestContext, APIResponse } from '@playwright/test';
import { ADMIN_E2E } from './configuracion';

export const CATEGORIAS = [
  { nombre: 'Mates', orden: 0, activa: true },
  { nombre: 'Termos', orden: 1, activa: true },
];

export const ESCALAS = [
  { nombre: 'Minorista', cantidadMinima: 1, porcentajeDescuento: 0 },
  { nombre: 'Mayorista', cantidadMinima: 100, porcentajeDescuento: 10 },
  { nombre: 'Distribuidor', cantidadMinima: 500, porcentajeDescuento: 20 },
];

export const MATE = {
  nombre: 'Mate Térmico Imperial',
  categoria: 'Mates',
  descripcion: 'Mate térmico de acero con forro.',
  variantes: [
    { sku: 'MATE-IMP-NEGRO', nombre: 'Negro', colorHex: '#1f1f1f', precio: 10000, stock: 50, orden: 0 },
    { sku: 'MATE-IMP-VERDE', nombre: 'Verde', colorHex: '#5f6e45', precio: 10000, precioOferta: 9000, stock: 2, orden: 1 },
  ],
};

export const TERMO = {
  nombre: 'Termo Acero Clásico',
  categoria: 'Termos',
  descripcion: 'Termo de un litro.',
  variantes: [{ sku: 'TERMO-ACERO', nombre: 'Único', precio: 30000, stock: 20, orden: 0 }],
};

export const CONTACTO = { whatsapp: '5491100000000', email: 'pruebas@tiendaalpi.test', instagram: 'tienda_alpi' };
export const BANNER = { visible: true, titulo: 'Mates para todos los días', subtitulo: 'Datos de prueba E2E' };

/** Corta la preparación con un mensaje claro si la API respondió con error. */
async function exigirOk(respuesta: APIResponse, accion: string): Promise<void> {
  if (!respuesta.ok()) {
    throw new Error(`No se pudo ${accion}: ${respuesta.status()} ${await respuesta.text()}`);
  }
}

/** Carga los datos de prueba usando los mismos endpoints que el panel. */
export async function cargarDatosDePrueba(api: APIRequestContext): Promise<void> {
  await exigirOk(await api.post('auth/login', { data: ADMIN_E2E }), 'iniciar sesión en la API');
  await exigirOk(await api.put('admin/escalas', { data: { escalas: ESCALAS } }), 'cargar las escalas');

  const idsCategorias = new Map<string, string>();
  for (const categoria of CATEGORIAS) {
    const respuesta = await api.post('admin/categorias', { data: categoria });
    await exigirOk(respuesta, `crear la categoría ${categoria.nombre}`);
    idsCategorias.set(categoria.nombre, (await respuesta.json()).id);
  }

  for (const { categoria, ...producto } of [MATE, TERMO]) {
    const datos = { ...producto, categoriaId: idsCategorias.get(categoria) };
    await exigirOk(await api.post('admin/productos', { data: datos }), `crear ${producto.nombre}`);
  }

  await exigirOk(await api.put('admin/contenido/contacto', { data: CONTACTO }), 'guardar el contacto');
  await exigirOk(await api.put('admin/contenido/banner', { data: BANNER }), 'guardar el banner');
  const faq = { preguntas: [{ pregunta: '¿Hacen envíos?', respuesta: 'Sí, a todo el país.' }] };
  await exigirOk(await api.put('admin/contenido/faq', { data: faq }), 'guardar las preguntas');
  const condiciones = { texto: '## Pagos\n\nEfectivo o transferencia.' };
  await exigirOk(await api.put('admin/contenido/condiciones', { data: condiciones }), 'guardar las condiciones');
}
