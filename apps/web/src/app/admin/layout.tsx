import type { Metadata } from 'next';
import { ProveedorSesion } from '@/lib/admin/sesion';

export const metadata: Metadata = {
  title: { default: 'Panel', template: '%s · Panel Alpi' },
  robots: { index: false, follow: false },
};

/** Todo el panel comparte la sesión y queda fuera de los buscadores. */
export default function LayoutAdmin({ children }: { children: React.ReactNode }) {
  return <ProveedorSesion>{children}</ProveedorSesion>;
}
