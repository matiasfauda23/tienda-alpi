import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { hashearContrasena } from '../src/comun/seguridad/contrasenas';
import { PrismaClient } from '../src/generated/prisma/client';

const LARGO_MINIMO_CONTRASENA = 12;
const FORMATO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Crea el administrador del panel o, si ya existe, le cambia la contraseña y cierra sus sesiones.
 * Uso: ADMIN_CONTRASENA="..." pnpm admin:crear correo@ejemplo.com
 */
async function crearAdministrador(): Promise<void> {
  const email = (process.argv[2] ?? '').trim().toLowerCase();
  const contrasena = process.env.ADMIN_CONTRASENA ?? '';

  if (!FORMATO_EMAIL.test(email)) {
    throw new Error('Indicá un email válido: pnpm admin:crear correo@ejemplo.com');
  }
  if (contrasena.length < LARGO_MINIMO_CONTRASENA) {
    throw new Error(`La contraseña debe tener al menos ${LARGO_MINIMO_CONTRASENA} caracteres.`);
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  try {
    const hashContrasena = await hashearContrasena(contrasena);
    await prisma.administrador.upsert({
      where: { email },
      create: { email, hashContrasena },
      update: { hashContrasena, hashRefreshToken: null },
    });
    console.log(`Administrador ${email} listo.`);
  } finally {
    await prisma.$disconnect();
  }
}

crearAdministrador().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
