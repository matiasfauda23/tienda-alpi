import { expect, test } from '@playwright/test';
import { ADMIN_E2E } from '../../configuracion';

// Estos tests arrancan sin la sesión guardada
test.use({ storageState: { cookies: [], origins: [] } });

test('sin sesión, el panel lleva al login recordando la página', async ({ page }) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/ingresar\?volver=%2Fadmin/);
});

test('una contraseña incorrecta muestra un mensaje que no revela si el email existe', async ({ page }) => {
  await page.goto('/admin/ingresar');
  await page.getByLabel('Email').fill(ADMIN_E2E.email);
  await page.getByLabel('Contraseña').fill('contrasena-incorrecta-123');
  await page.getByRole('button', { name: 'Ingresar' }).click();
  await expect(page.getByText('Email o contraseña incorrectos.')).toBeVisible();
});
