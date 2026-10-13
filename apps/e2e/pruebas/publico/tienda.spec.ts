import { expect, test } from '@playwright/test';
import { BANNER, MATE, TERMO } from '../../datos';

test('el inicio muestra el banner cargado desde el panel', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(BANNER.titulo)).toBeVisible();
});

test('el catálogo busca sin importar las tildes', async ({ page }) => {
  await page.goto('/productos');
  await page.getByLabel('Buscar').fill('termico');
  await page.getByRole('button', { name: 'Aplicar filtros' }).click();
  await expect(page).toHaveURL(/buscar=termico/);
  await expect(page.getByRole('heading', { name: MATE.nombre })).toBeVisible();
  await expect(page.getByRole('heading', { name: TERMO.nombre })).toHaveCount(0);
});

test('el catálogo filtra por categoría', async ({ page }) => {
  await page.goto('/productos?categoria=termos');
  await expect(page.getByRole('heading', { name: TERMO.nombre })).toBeVisible();
  await expect(page.getByRole('heading', { name: MATE.nombre })).toHaveCount(0);
});

test('la ficha cambia de variante y muestra la oferta y el stock bajo', async ({ page }) => {
  await page.goto('/productos');
  await page.getByRole('link', { name: new RegExp(MATE.nombre) }).click();
  await expect(page.getByRole('heading', { level: 1, name: MATE.nombre })).toBeVisible();

  await page.getByRole('button', { name: 'Verde' }).click();
  await expect(page.getByRole('button', { name: 'Verde' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText('Últimas unidades')).toBeVisible();
  await expect(page.getByText(/9\.000/).first()).toBeVisible();
});

test('el pedido aplica la escala mayorista y arma el mensaje de WhatsApp', async ({ page }) => {
  await page.goto('/productos');
  await page.getByRole('link', { name: new RegExp(MATE.nombre) }).click();

  const cantidad = page.getByLabel('Cantidad a agregar');
  await cantidad.fill('100');
  await cantidad.press('Enter');
  await page.getByRole('button', { name: 'Agregar al pedido' }).click();
  await expect(page.getByText('Agregaste 100 unidades.')).toBeVisible();

  await page.getByRole('link', { name: 'Ver pedido' }).click();
  await expect(page.getByRole('heading', { name: 'Mi pedido' })).toBeVisible();
  await expect(page.getByText(/Mayorista/).first()).toBeVisible();
  // 100 unidades × $9.000 (10.000 con 10 % de descuento) = $900.000
  await expect(page.getByText(/900\.000/).first()).toBeVisible();

  // Se intercepta wa.me para no salir a internet: solo interesa el mensaje armado
  await page.route('https://wa.me/**', (ruta) => ruta.fulfill({ status: 200, body: 'WhatsApp simulado' }));
  await page.getByRole('button', { name: 'Enviar pedido por WhatsApp' }).click();
  await page.waitForURL(/wa\.me/);

  const mensaje = new URL(page.url()).searchParams.get('text') ?? '';
  expect(mensaje).toContain('100 x Mate Térmico Imperial (Negro) [MATE-IMP-NEGRO]');
  expect(mensaje).toContain('Escala: Mayorista');
});
