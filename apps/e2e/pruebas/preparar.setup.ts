import { expect, request, test as preparar } from '@playwright/test';
import { ADMIN_E2E, RUTA_SESION, URL_API, URL_WEB } from '../configuracion';
import { cargarDatosDePrueba } from '../datos';

preparar('cargar los datos de prueba e iniciar sesión en el panel', async ({ page }) => {
  const api = await request.newContext({ baseURL: `${URL_API}/`, extraHTTPHeaders: { Origin: URL_WEB } });
  await cargarDatosDePrueba(api);
  await api.dispose();

  await page.goto('/admin/ingresar');
  await page.getByLabel('Email').fill(ADMIN_E2E.email);
  await page.getByLabel('Contraseña').fill(ADMIN_E2E.contrasena);
  await page.getByRole('button', { name: 'Ingresar' }).click();

  // Se espera algo que solo existe DESPUÉS del login (el título "Panel de administración" también está en el login)
  await expect(page).toHaveURL(`${URL_WEB}/admin`);
  await expect(page.getByText('¿Qué querés actualizar hoy?')).toBeVisible();
  await page.context().storageState({ path: RUTA_SESION });
});
