import { defineConfig, devices } from '@playwright/test';
import {
  ADMIN_E2E,
  ENTORNO_API,
  ENTORNO_WEB,
  PUERTO_WEB,
  RAIZ_PROYECTO,
  RUTA_SESION,
  URL_API,
  URL_WEB,
} from './configuracion';

const EN_CI = Boolean(process.env.CI);

export default defineConfig({
  testDir: './pruebas',
  // Un test por vez: algunos cambian datos (precios, visibilidad) que otros leen
  fullyParallel: false,
  workers: 1,
  retries: EN_CI ? 1 : 0,
  forbidOnly: EN_CI,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: EN_CI ? [['github'], ['html', { open: 'never' }]] : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: URL_WEB,
    locale: 'es-AR',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'preparar', testMatch: /preparar\.setup\.ts/ },
    {
      name: 'publico',
      testMatch: /publico\/.*\.spec\.ts/,
      dependencies: ['preparar'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'admin',
      testMatch: /admin\/.*\.spec\.ts/,
      dependencies: ['preparar', 'publico'],
      use: { ...devices['Desktop Chrome'], storageState: RUTA_SESION },
    },
  ],
  webServer: [
    {
      // Base limpia + usuario de pruebas + API
      command: [
        'pnpm --filter @tienda-alpi/api exec prisma migrate reset --force',
        `pnpm --filter @tienda-alpi/api admin:crear ${ADMIN_E2E.email}`,
        'pnpm --filter @tienda-alpi/api start',
      ].join(' && '),
      cwd: RAIZ_PROYECTO,
      url: `${URL_API}/salud`,
      env: ENTORNO_API,
      timeout: 180_000,
      reuseExistingServer: false,
    },
    {
      command: `pnpm --filter @tienda-alpi/web exec next dev --port ${PUERTO_WEB}`,
      cwd: RAIZ_PROYECTO,
      url: `${URL_WEB}/admin/ingresar`,
      env: ENTORNO_WEB,
      timeout: 180_000,
      reuseExistingServer: false,
    },
  ],
});
