import { expect, test } from '@playwright/test';
import { TERMO } from '../../datos';

test('un precio cambiado en el panel se ve en la tienda sin esperar la caché', async ({ page }) => {
  await page.goto('/admin/productos');
  await page.getByRole('link', { name: TERMO.nombre }).click();
  await expect(page.getByRole('heading', { level: 1, name: TERMO.nombre })).toBeVisible();

  await page.getByLabel('Precio ($)', { exact: true }).fill('35000');
  await page.getByRole('button', { name: 'Guardar variante' }).click();
  await expect(page.getByText('Cambios guardados.')).toBeVisible();

  // El aviso de revalidación viaja en segundo plano: se reintenta hasta que la tienda lo refleje
  await expect(async () => {
    await page.goto('/productos?categoria=termos');
    await expect(page.getByText(/35\.000/).first()).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30_000 });
});

test('ocultar un producto lo saca del catálogo, y mostrarlo lo devuelve', async ({ page }) => {
  await page.goto('/admin/productos');
  const fila = page.getByRole('row', { name: new RegExp(TERMO.nombre) });
  await fila.getByRole('button', { name: 'Ocultar' }).click();
  await expect(fila.getByText('Oculto')).toBeVisible();

  await expect(async () => {
    await page.goto('/productos');
    await expect(page.getByRole('heading', { name: TERMO.nombre })).toHaveCount(0, { timeout: 2000 });
  }).toPass({ timeout: 30_000 });

  await page.goto('/admin/productos');
  await page.getByRole('row', { name: new RegExp(TERMO.nombre) }).getByRole('button', { name: 'Mostrar' }).click();
  await expect(async () => {
    await page.goto('/productos');
    await expect(page.getByRole('heading', { name: TERMO.nombre })).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30_000 });
});
